import { JSX } from 'react'

export default function Wordmark(): JSX.Element {
  return (
    <div
      className="flex items-center gap-3 animate-fade-in group cursor-pointer"
      aria-label="CoffeeShare logo"
      role="img"
    >
      <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-soft)] via-[var(--bg-muted)] to-transparent border border-[var(--border-subtle)] shadow-[var(--shadow-brand)]">
        <svg
          className="transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 drop-shadow-[0_0_10px_rgba(243,112,33,0.45)]"
          width="30"
          height="30"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 15H42.5C45.2614 15 47.5 17.2386 47.5 20V24C47.5 32.2843 40.7843 39 32.5 39H23.5C15.2157 39 8.5 32.2843 8.5 24V20C8.5 17.2386 10.7386 15 13.5 15H14Z"
            fill="oklch(0.72 0.18 48)"
          />
          <path
            d="M47.5 22H51C54.3137 22 57 24.6863 57 28C57 31.3137 54.3137 34 51 34H47.5"
            stroke="#f6c09a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path d="M20 45H43" stroke="#f37021" strokeWidth="4" strokeLinecap="round" />
          <path d="M19 9V13" stroke="#f6c09a" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 6V13" stroke="#f6c09a" strokeWidth="3" strokeLinecap="round" />
          <path d="M41 9V13" stroke="#f6c09a" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M24 28L29 22L34 26L40 19"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="19" r="2.3" fill="#1f2937" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-black tracking-tighter heading-display bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] group-hover:from-[var(--brand)] group-hover:to-[var(--text-primary)] transition-all duration-300">
          CoffeeShare
        </div>
        <span className="text-[11px] text-muted font-semibold tracking-wide uppercase mt-[-2px] group-hover:text-brand transition-colors">
          Direct transfer studio
        </span>
      </div>
    </div>
  )
}
