'use client'

import React, { JSX, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, Cloud, Lock, MessageCircle, Shield, Smartphone, Zap, ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Do you store files on your servers?',
    a: 'No. Files stream directly between peers over WebRTC and are never staged on CoffeeShare infrastructure.',
  },
  {
    q: 'Can I lock my transfer?',
    a: 'Yes. You can add a password to any transfer and optionally enable one-time burn-after-pour links.',
  },
  {
    q: 'What if my transfer is large?',
    a: 'CoffeeShare is built for high-volume sessions. Throughput adapts to network conditions in real time.',
  },
  {
    q: 'Can I communicate with the receiver while sending?',
    a: 'Yes. Live chat and voice/video call controls stay available throughout the session.',
  },
]

export default function MarketingSections(): JSX.Element {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="w-full mt-20 space-y-16 pb-16">
      <section id="features" className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pb-4 border-b-4 border-[var(--border-strong)]">
          <h2 className="heading-display text-4xl md:text-5xl font-black uppercase">Built for<br/><span className="text-brand">Speed & Trust</span></h2>
          <span className="text-primary font-bold tracking-widest uppercase mt-4 md:mt-0 bg-bauhaus-yellow px-3 py-1 border-2 border-[var(--border-strong)]">WebRTC native transfer pipeline</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <motion.article whileHover={{ y: -4 }} className="panel bg-bauhaus-blue text-white rounded-none p-6 md:col-span-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-4 border-white opacity-20 pointer-events-none" />
            <p className="text-xs uppercase tracking-widest text-white mb-2 font-bold border-b-2 border-white inline-block pb-1">Live Transfer Preview</p>
            <h3 className="heading-display text-3xl font-black mb-4 uppercase mt-2">Real time updates</h3>
            <p className="text-white/90 font-bold mb-6 max-w-md">
              Sender and receiver are visualized as linked nodes with animated stream indicators.
            </p>
            <div className="rounded-none border-4 border-[var(--border-strong)] bg-white px-4 py-6 flex items-center justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-bauhaus-yellow border-4 border-[var(--border-strong)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                  <Smartphone className="w-6 h-6 text-primary" strokeWidth={3} />
                </div>
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Sender</span>
              </div>
              <div className="flex-1 mx-6 h-1 bg-[var(--border-strong)] relative overflow-hidden flex items-center">
                <motion.span
                  className="absolute left-0 w-8 h-8 bg-bauhaus-red border-4 border-[var(--border-strong)] rounded-none shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-none bg-bauhaus-red border-4 border-[var(--border-strong)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--shadow-color)] transform rotate-12">
                  <Shield className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Receiver</span>
              </div>
            </div>
          </motion.article>

          <motion.article whileHover={{ y: -4 }} className="panel bg-bauhaus-red text-white rounded-none p-6 md:col-span-2 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-20 transform rotate-45 pointer-events-none" />
            <p className="text-xs uppercase tracking-widest text-white mb-2 font-bold border-b-2 border-white inline-block pb-1">Social Proof</p>
            <h3 className="heading-display text-3xl font-black uppercase mt-2">Trusted by teams</h3>
            <ul className="mt-6 space-y-4 font-bold text-white/90">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-bauhaus-yellow" strokeWidth={3} /> No signup required</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-bauhaus-yellow" strokeWidth={3} /> Cross-platform</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-bauhaus-yellow" strokeWidth={3} /> E2E encrypted</li>
            </ul>
          </motion.article>

          <motion.article whileHover={{ y: -4 }} className="panel bg-bauhaus-yellow text-primary rounded-none p-6 md:col-span-2">
            <div className="w-12 h-12 bg-primary text-bauhaus-yellow flex items-center justify-center mb-4 border-2 border-primary">
              <Zap className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="heading-display text-2xl font-black mb-2 uppercase">Fast startup</h3>
            <p className="text-primary font-bold text-sm">Start transfer in seconds with direct peer negotiation.</p>
          </motion.article>
          
          <motion.article whileHover={{ y: -4 }} className="panel bg-[var(--bg-card)] rounded-none p-6 md:col-span-2">
            <div className="w-12 h-12 bg-bauhaus-blue text-white rounded-full flex items-center justify-center mb-4 border-4 border-strong shadow-[4px_4px_0px_0px_var(--shadow-color)]">
              <Lock className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="heading-display text-2xl font-black mb-2 uppercase">Burn mode</h3>
            <p className="text-primary font-bold text-sm">Control access and auto-close links after first successful download.</p>
          </motion.article>
          
          <motion.article whileHover={{ y: -4 }} className="panel bg-[var(--bg-card)] rounded-none p-6 md:col-span-2">
            <div className="w-12 h-12 bg-bauhaus-red text-white flex items-center justify-center mb-4 border-4 border-strong shadow-[4px_4px_0px_0px_var(--shadow-color)] transform -rotate-6">
              <MessageCircle className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="heading-display text-2xl font-black mb-2 uppercase">Live collab</h3>
            <p className="text-primary font-bold text-sm">Chat and call without breaking your transfer flow.</p>
          </motion.article>
        </div>
      </section>

      <section id="how-it-works" className="w-full">
        <div className="border-b-4 border-strong mb-8 pb-4">
          <h2 className="heading-display text-4xl font-black uppercase">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['Pick files', 'Drop or browse files/folders from your device.', 'bg-bauhaus-red', 'rounded-none'],
            ['Share link', 'CoffeeShare creates a direct peer invite link.', 'bg-bauhaus-yellow', 'rounded-full'],
            ['Transfer', 'Receiver downloads from your browser in real time.', 'bg-bauhaus-blue', 'rounded-none transform rotate-3'],
          ].map(([title, desc, colorClass, shapeClass], index) => (
            <motion.article key={title} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} className="panel bg-[var(--bg-card)] rounded-none p-6 relative overflow-visible">
              <div className={`absolute -top-6 -right-4 w-12 h-12 ${colorClass} border-4 border-strong flex items-center justify-center text-xl font-black text-white ${shapeClass} shadow-[4px_4px_0px_0px_var(--shadow-color)]`}>
                {index + 1}
              </div>
              <h3 className="heading-display text-2xl font-black mb-3 uppercase pr-8">{title}</h3>
              <p className="text-primary font-bold text-sm">{desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="panel bg-[var(--bg-elevated)] rounded-none p-8 opacity-80 grayscale">
          <h3 className="heading-display text-3xl font-black mb-6 uppercase text-muted">Legacy Flow</h3>
          <div className="flex items-center gap-4 text-muted mb-6">
            <Smartphone className="w-8 h-8" strokeWidth={3} />
            <ArrowRight className="w-6 h-6" strokeWidth={3} />
            <Cloud className="w-8 h-8" strokeWidth={3} />
            <ArrowRight className="w-6 h-6" strokeWidth={3} />
            <Smartphone className="w-8 h-8" strokeWidth={3} />
          </div>
          <p className="text-primary font-bold">Double transfer path, cloud staging delays, and higher exposure surface.</p>
        </article>

        <article className="panel bg-bauhaus-red text-white rounded-none p-8">
          <h3 className="heading-display text-3xl font-black mb-6 uppercase">CoffeeShare Flow</h3>
          <div className="flex items-center gap-4 text-white mb-6">
            <Smartphone className="w-8 h-8" strokeWidth={3} />
            <div className="h-2 flex-1 bg-bauhaus-yellow border-y-2 border-strong relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==')] opacity-20"></div>
            </div>
            <Smartphone className="w-8 h-8" strokeWidth={3} />
          </div>
          <p className="font-bold">Direct encrypted peer channel with near-instant session startup and no cloud storage.</p>
        </article>
      </section>

      <section id="security" className="panel bg-[var(--bg-card)] rounded-none p-8">
        <div className="flex items-center gap-4 mb-6 border-b-4 border-strong pb-4">
          <Shield className="w-10 h-10 text-bauhaus-blue" strokeWidth={3} />
          <h3 className="heading-display text-3xl md:text-4xl font-black uppercase">Security</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bauhaus-yellow border-4 border-strong p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-primary">
            <p className="text-xs uppercase tracking-widest font-black mb-2 border-b-2 border-strong inline-block">Encryption</p>
            <p className="font-bold text-sm">WebRTC DTLS transport secures data in transit end-to-end.</p>
          </div>
          <div className="bg-bauhaus-blue text-white border-4 border-strong p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <p className="text-xs uppercase tracking-widest font-black mb-2 border-b-2 border-white inline-block">No storage</p>
            <p className="font-bold text-sm">Files are not uploaded to persistent cloud buckets.</p>
          </div>
          <div className="bg-bauhaus-red text-white border-4 border-strong p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <p className="text-xs uppercase tracking-widest font-black mb-2 border-b-2 border-white inline-block">Control</p>
            <p className="font-bold text-sm">Password-protect and expire links using burn-after-pour mode.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="w-full">
        <div className="border-b-4 border-strong mb-8 pb-4">
          <h3 className="heading-display text-4xl font-black uppercase">FAQ</h3>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.q} className={`border-4 border-strong transition-colors duration-300 ${isOpen ? 'bg-bauhaus-red shadow-[8px_8px_0px_0px_var(--shadow-color)]' : 'bg-[var(--bg-card)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)]'}`}>
                <button
                  className="w-full text-left p-4 md:p-6 flex items-center justify-between"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className={`font-black uppercase tracking-wide pr-4 ${isOpen ? 'text-white' : 'text-primary'}`}>{faq.q}</span>
                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 transition-transform duration-300 ${isOpen ? 'rotate-180 border-white text-white' : 'border-strong text-primary bg-bauhaus-yellow'}`}>
                    <ChevronDown className="w-5 h-5" strokeWidth={3} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-bauhaus-yellow border-t-4 border-strong"
                    >
                      <div className="p-4 md:p-6 text-primary font-bold">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  )
}
