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
    <div className="relative flex items-center gap-2 mb-2">
      <label
        className={`font-black text-xs uppercase tracking-widest ${
          hasError ? 'text-bauhaus-red' : 'text-primary'
        }`}
      >
        {children}
      </label>
      {tooltip && (
        <div className="relative flex items-center group">
          <div
            className="text-sm text-primary/50 cursor-help group-hover:text-primary transition-colors flex items-center justify-center w-5 h-5 border-2 border-primary/50 group-hover:border-primary rounded-full font-bold pb-0.5"
            role="button"
            aria-label="Show tooltip"
            tabIndex={0}
          >
            ?
          </div>
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            <div className="bg-bauhaus-yellow text-primary text-xs font-bold px-4 py-3 w-[250px] border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
              {tooltip}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
