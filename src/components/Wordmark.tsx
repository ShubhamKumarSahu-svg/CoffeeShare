import { JSX } from 'react'

export default function Wordmark(): JSX.Element {
  return (
    <div
      className="flex items-center gap-3 animate-fade-in group cursor-pointer"
      aria-label="CoffeeShare logo"
      role="img"
    >
      <div className="w-10 h-10 flex items-center justify-center">
          className="transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_10px_rgba(243,112,33,0.4)]"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coffee cup body */}
          <path d="M5 4H17C17 4 17.5 14 11 14C4.5 14 5 4 5 4Z" fill="#f37021" />
          {/* Cup Handle */}
          <path d="M17 6H19.5C20.8807 6 22 7.11929 22 8.5C22 9.88071 20.8807 11 19.5 11H16.5" stroke="#f37021" strokeWidth="2" strokeLinecap="round" />
          {/* Coffee Steam */}
          <path d="M9 2V3" stroke="#f37021" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M13 1V3" stroke="#f37021" strokeWidth="1.5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="8.5" cy="8.5" r="1.2" fill="#1c1c24" />
          <circle cx="13.5" cy="8.5" r="1.2" fill="#1c1c24" />
          {/* Smile */}
          <path d="M9.5 11C9.5 11 10.5 12 11 12C11.5 12 12.5 11 12.5 11" stroke="#1c1c24" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1
          className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-stone-900 to-stone-600 dark:from-white dark:to-stone-400 drop-shadow-sm group-hover:from-[#f37021] group-hover:to-[#ff985c] transition-all duration-300"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          CoffeeShare
        </h1>
        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold tracking-wide uppercase mt-[-2px] group-hover:text-[#f37021]/80 transition-colors">
          Making sharing simple
        </span>
      </div>
    </div>
  )
}
