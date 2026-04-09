import { Link } from 'next-view-transitions'
import { JSX } from 'react'

export default function ReturnHome(): JSX.Element {
  return (
    <div className="flex justify-center">
      <Link
        href="/"
        className="accent-text hover:underline transition-colors duration-200 font-medium text-sm flex items-center gap-1.5"
      >
        Share another file
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
  )
}
