import { JSX } from 'react'

export function ErrorMessage({ message }: { message: string }): JSX.Element {
  return (
    <div
      className="bg-[#fef2f2] dark:bg-[#2a1515] border border-[#fecaca] dark:border-[#4a2020] text-[#dc2626] dark:text-[#f87171] px-5 py-3.5 rounded-xl"
      role="alert"
    >
      <span className="block sm:inline text-sm">{message}</span>
    </div>
  )
}
