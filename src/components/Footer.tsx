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
      className="text-brand hover:underline transition-colors duration-200"
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
    <footer className="w-full text-center py-10 mt-auto text-xs border-t border-[var(--border-subtle)] bg-transparent z-40">
      <div className="flex flex-col items-center gap-4 px-4 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#drop-zone-button" className="btn btn-hero">Start a secure share</a>
          <a href="#faq" className="btn btn-ghost">Read FAQ</a>
        </div>
        <p className="text-muted flex items-center justify-center gap-1.5">
          <span className="font-semibold text-secondary">CoffeeShare</span>
          <span className="text-muted">—</span>
          Secure P2P file transfers via WebRTC
        </p>
        <p className="text-muted mono text-[10px]">
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
