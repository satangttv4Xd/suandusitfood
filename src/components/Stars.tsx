import { Icon } from './Icon'

interface StarsProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const

/**
 * Five stars with a partial fill for the fractional part, clipped with a
 * width-limited overlay so 4.6 really looks like 4.6 rather than rounding to 5.
 */
export function Stars({ value, size = 'md', className = '' }: StarsProps) {
  const clamped = Math.max(0, Math.min(5, value))
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={`คะแนน ${clamped.toFixed(1)} จาก 5`}
    >
      <span className="flex gap-0.5 text-brand-200">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" solid className={sizes[size]} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-gold-500"
        style={{ width: `${(clamped / 5) * 100}%` }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" solid className={`${sizes[size]} shrink-0`} />
        ))}
      </span>
    </span>
  )
}

interface StarInputProps {
  value: number
  onChange: (value: number) => void
  name?: string
}

/** A radio group that happens to look like stars — keyboard and screen reader friendly. */
export function StarInput({ value, onChange, name = 'rating' }: StarInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="ให้คะแนน">
      {[1, 2, 3, 4, 5].map((score) => (
        <label
          key={score}
          className="cursor-pointer p-0.5 text-brand-200 transition-colors duration-200 hover:text-gold-400 has-checked:text-gold-500 has-focus-visible:outline has-focus-visible:outline-brand-600"
          style={{ color: score <= value ? 'var(--color-gold-500)' : undefined }}
        >
          <input
            type="radio"
            name={name}
            value={score}
            checked={value === score}
            onChange={() => onChange(score)}
            className="sr-only"
          />
          <Icon name="star" solid className="h-7 w-7" />
          <span className="sr-only">{score} ดาว</span>
        </label>
      ))}
    </div>
  )
}
