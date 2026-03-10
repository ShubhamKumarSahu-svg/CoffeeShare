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
    <footer className="w-full text-center py-12 mt-auto text-xs border-t-4 border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,0.05)] z-40">
      <div className="flex flex-col items-center gap-6 px-4 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#drop-zone-button" className="btn btn-hero">Start a secure share</a>
          <a href="#faq" className="btn btn-ghost">Read FAQ</a>
        </div>
        <div className="w-16 h-1 bg-bauhaus-red border-y-2 border-[var(--border-strong)]"></div>
        <p className="text-primary flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm">
          <span className="font-black bg-bauhaus-yellow px-2 py-0.5 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">CoffeeShare</span>
          <span className="text-bauhaus-red">—</span>
          Secure P2P file transfers via WebRTC
        </p>
        <p className="text-primary font-bold uppercase tracking-widest text-[10px]">
          next.js · peerjs · webrtc &middot;{' '}
          <FooterLink href="https://github.com/ShubhamKumarSahu-svg/CoffeeShare">
            <span className="text-bauhaus-blue underline underline-offset-4 decoration-2">source</span>
          </FooterLink>
        </p>
      </div>
    </footer>
  )
}

export default Footer
