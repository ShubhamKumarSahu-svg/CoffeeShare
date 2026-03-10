import { Link } from 'next-view-transitions'
import { JSX } from 'react'

export default function ReturnHome(): JSX.Element {
  return (
    <div className="flex justify-center mt-4">
      <Link
        href="/"
        className="btn btn-hero bg-bauhaus-yellow text-primary border-4 border-[var(--border-strong)] px-6 py-3 font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Return Home
      </Link>
    </div>
  )
}
