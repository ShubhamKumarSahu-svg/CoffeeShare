import { JSX } from 'react'

export default function Wordmark(): JSX.Element {
  return (
    <a
      href="/"
      className="flex items-center gap-3 animate-fade-in group cursor-pointer"
      aria-label="CoffeeShare logo"
      role="img"
    >
      <div className="flex items-center justify-center">
        <svg width="60" height="34" viewBox="0 0 60 34" className="overflow-visible">
          {/* Yellow Circle (Handle) */}
          <circle 
            cx="36" cy="22" r="8" 
            fill="var(--bauhaus-yellow)" 
            stroke="var(--border-strong)" 
            strokeWidth="3" 
            className="transition-transform duration-300 group-hover:-translate-y-1" 
          />
          {/* Blue Triangle (Pour-over Cone) */}
          <polygon 
            points="12,3 40,3 26,17" 
            fill="var(--bauhaus-blue)" 
            stroke="var(--border-strong)" 
            strokeWidth="3" 
            className="transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-6" 
            style={{ transformOrigin: '26px 8px' }} 
          />
          {/* Red Square (Mug Body) */}
          <rect 
            x="16" y="13" width="20" height="18" 
            fill="var(--bauhaus-red)" 
            stroke="var(--border-strong)" 
            strokeWidth="3" 
            className="transition-transform duration-300 group-hover:-translate-y-1" 
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-black tracking-tighter heading-display text-primary transition-all duration-300 group-hover:text-[var(--bauhaus-red)]">
          CoffeeShare
        </div>
        <span className="text-[11px] text-muted font-bold tracking-widest uppercase mt-[-2px] transition-colors">
          Direct transfer
        </span>
      </div>
    </a>
  )
}
// .
// .
