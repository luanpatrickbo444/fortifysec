const LEVELS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  insane: 4,
}

export function DifficultyMeter({ difficulty }: { difficulty?: string | null }) {
  const label = difficulty || 'Easy'
  const level = LEVELS[label.toLowerCase()] || 1

  return (
    <div className={`difficulty-meter diff-${label.toLowerCase()}`} title={`Dificuldade: ${label}`}>
      <div className="difficulty-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <i key={bar} className={bar <= level ? 'on' : ''} />
        ))}
      </div>
      <span>{label.toUpperCase()}</span>
    </div>
  )
}
