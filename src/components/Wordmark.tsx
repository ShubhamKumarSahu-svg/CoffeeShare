import { JSX } from 'react'

export default function Wordmark(): JSX.Element {
  return (
    <div
      className="flex items-center gap-3 animate-fade-in"
      aria-label="CoffeeShare logo"
      role="img"
    >
      <div className="w-11 h-11 rounded-xl bg-[#6f4e37] flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Steam */}
          <path
            d="M7 5C7 3.5 8 2.5 8 1"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M11 4C11 2.5 12 1.5 12 0"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Cup body */}
          <rect
            x="4"
            y="8"
            width="12"
            height="11"
            rx="2"
            fill="white"
            opacity="0.9"
          />
          {/* Handle */}
          <path
            d="M16 10H18C19.1 10 20 10.9 20 12V14C20 15.1 19.1 16 18 16H16"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            opacity="0.9"
          />
          {/* Coffee surface */}
          <ellipse
            cx="10"
            cy="12"
            rx="4.5"
            ry="1"
            fill="#6f4e37"
            opacity="0.4"
          />
          {/* Saucer */}
          <rect
            x="2"
            y="19"
            width="16"
            height="2"
            rx="1"
            fill="white"
            opacity="0.7"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1
          className="text-2xl font-bold tracking-tight text-[#2c2c2c] dark:text-[#e0ddd8]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Coffee
          <span className="text-[#6f4e37] dark:text-[#c4956a]">Share</span>
        </h1>
        <span className="mono text-[9px] font-medium text-[#a09a90] dark:text-[#5a5850] tracking-[0.25em] uppercase">
          peer-to-peer
        </span>
      </div>
    </div>
  )
}
