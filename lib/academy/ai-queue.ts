type QueueJob = {
  start: () => void;
  reject: (reason: Error) => void;
  signal?: AbortSignal;
  onAbort: () => void;
  timer: ReturnType<typeof setTimeout>;
};

const MAX_WAITING = 2;
const WAIT_TIMEOUT_MS = 45000;

let active = false;
const waiting: QueueJob[] = [];

function remove(job: QueueJob) {
  const index = waiting.indexOf(job);
  if (index !== -1) waiting.splice(index, 1);
  clearTimeout(job.timer);
  job.signal?.removeEventListener('abort', job.onAbort);
}

function next() {
  if (active) return;

  while (waiting.length) {
    const job = waiting.shift()!;
    clearTimeout(job.timer);
    job.signal?.removeEventListener('abort', job.onAbort);

    if (job.signal?.aborted) {
      job.reject(new Error('CANCELLED'));
      continue;
    }

    active = true;
    job.start();
    return;
  }
}

export async function acquireAI(
  signal?: AbortSignal
): Promise<() => void> {
  if (signal?.aborted) {
    throw new Error('CANCELLED');
  }

  if (!active && waiting.length === 0) {
    active = true;
    let released = false;

    return () => {
      if (released) return;
      released = true;
      active = false;
      next();
    };
  }

  if (waiting.length >= MAX_WAITING) {
    throw new Error('QUEUE_FULL');
  }

  return new Promise((resolve, reject) => {
    const job: QueueJob = {
      start: () => {
        let released = false;

        resolve(() => {
          if (released) return;
          released = true;
          active = false;
          next();
        });
      },
      reject,
      signal,
      onAbort: () => {},
      timer: undefined as unknown as ReturnType<typeof setTimeout>
    };

    job.onAbort = () => {
      remove(job);
      reject(new Error('CANCELLED'));
      next();
    };

    job.timer = setTimeout(() => {
      remove(job);
      reject(new Error('QUEUE_TIMEOUT'));
      next();
    }, WAIT_TIMEOUT_MS);

    signal?.addEventListener('abort', job.onAbort, { once: true });
    waiting.push(job);

    if (signal?.aborted) job.onAbort();
  });
}
