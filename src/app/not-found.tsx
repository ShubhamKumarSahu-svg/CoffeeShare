import { JSX } from 'react'
import Spinner from '../components/Spinner'
import Wordmark from '../components/Wordmark'
import ReturnHome from '../components/ReturnHome'
import TitleText from '../components/TitleText'

export const metadata = {
  title: 'CoffeeShare - 404: Not Found',
  description: 'This share link does not exist or has expired.',
}

export default async function NotFound(): Promise<JSX.Element> {
  return (
    <div className="flex flex-col items-center space-y-6 py-14 max-w-xl mx-auto animate-fade-in">
      <Spinner />
      <Wordmark />
      <TitleText>
        404 — This share link doesn&apos;t exist or has expired.
      </TitleText>
      <ReturnHome />
    </div>
  )
}
