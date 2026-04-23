'use client'

import React, { JSX } from 'react'

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <a
      className="accent-text hover:underline transition-colors duration-200"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export function Footer(): JSX.Element {
  return (
    <footer className="w-full text-center py-8 mt-auto text-xs border-t border-stone-200 dark:border-stone-800 bg-transparent z-40">
      <div className="flex flex-col items-center gap-1 px-4">
        <p className="text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
          <span className="font-semibold text-stone-700 dark:text-stone-200">CoffeeShare</span>
          <span className="text-stone-300 dark:text-stone-600">—</span>
          Secure P2P file transfers via WebRTC
        </p>
        <p className="text-stone-400 dark:text-stone-500 mono text-[10px] mt-1">
          next.js · peerjs · webrtc &middot;{' '}
          <FooterLink href="https://github.com/ShubhamKumarSahu-svg/CoffeeShare">
            source
          </FooterLink>
        </p>
      </div>
    </footer>
  )
}

export default Footer
