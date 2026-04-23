import { JSX } from 'react'
import Spinner from '../../components/Spinner'
import Wordmark from '../../components/Wordmark'
import TitleText from '../../components/TitleText'
import ReturnHome from '../../components/ReturnHome'

export default function ReportedPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center space-y-6 py-14 max-w-md mx-auto animate-fade-in">
      <Spinner />
      <Wordmark />

      <TitleText>This share has been halted.</TitleText>
      <div className="surface rounded-2xl px-7 py-6 w-full">
        <h3 className="text-base font-semibold text-[#2c2c2c] dark:text-[#e0ddd8] mb-3">
          Notice
        </h3>
        <p className="text-sm text-[#5a5550] dark:text-[#9a9690] leading-relaxed mb-5">
          This share has been put on hold for potential violations of our terms
          of service. Our team is reviewing it.
        </p>
        <div className="mono text-xs text-[#a09a90] dark:text-[#5a5850] italic">
          — pizzashare team
        </div>
      </div>

      <ReturnHome />
    </div>
  )
}
