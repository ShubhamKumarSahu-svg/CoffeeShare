import React, { JSX } from 'react'

export default function InputLabel({
  children,
  hasError = false,
  tooltip,
}: {
  children: React.ReactNode
  hasError?: boolean
  tooltip?: string
}): JSX.Element {
  return (
    <div className="relative flex items-center gap-1">
      <label
        className={`mono text-[9px] mb-1 font-semibold tracking-[0.15em] uppercase ${
          hasError ? 'text-[#e05a4f]' : 'text-[#a09a90] dark:text-[#5a5850]'
        }`}
      >
        {children}
      </label>
      {tooltip && (
        <div className="relative">
          <div
            className="text-[10px] text-[#c0bbb3] dark:text-[#4a4a44] cursor-help hover:text-[#8a8580] peer focus:text-[#8a8580] transition-colors"
            role="button"
            aria-label="Show tooltip"
            tabIndex={0}
          >
            ⓘ
          </div>
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-1 opacity-0 peer-hover:opacity-100 peer-focus:opacity-100 transition-opacity duration-200 z-10">
            <div className="surface text-[#5a5550] dark:text-[#9a9690] text-xs rounded-lg px-3 py-2 w-[300px] shadow-lg">
              {tooltip}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
