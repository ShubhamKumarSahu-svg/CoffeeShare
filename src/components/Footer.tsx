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
    <>
      <div className="h-[72px]" />
      <footer className="fixed bottom-0 left-0 right-0 text-center py-3 text-xs border-t border-[#ebe6dd] dark:border-[#2a2a27] bg-[#faf8f5]/90 dark:bg-[#111110]/90 backdrop-blur-sm z-40">
        <div className="flex flex-col items-center gap-0.5 px-4">
          <p className="text-[#8a8580] dark:text-[#6a6660] flex items-center gap-1.5">
            <span className="text-sm">☕</span>
            <span className="font-semibold accent-text">CoffeeShare</span>
            <span className="text-[#c0bbb3] dark:text-[#3a3a36]">—</span>
            Secure P2P file transfers via WebRTC
          </p>
          <p className="text-[#b0aaa2] dark:text-[#4a4a44] mono text-[10px]">
            next.js · peerjs · webrtc &middot;{' '}
            <FooterLink href="https://github.com/kern/filepizza">
              source
            </FooterLink>
          </p>
        </div>
      </footer>
    </>
  )
}

export default Footer
