export function AppErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
        <p className="text-sm opacity-70">{error.message}</p>
      </div>
    </div>
  );
}