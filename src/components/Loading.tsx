import React, { JSX } from 'react'
import { motion } from 'framer-motion'

export default function Loading({ text }: { text: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in my-8 p-8 border-4 border-[var(--border-strong)] bg-white shadow-[8px_8px_0px_0px_var(--shadow-color)]">
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: 360, borderRadius: ["0%", "50%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 bg-bauhaus-red border-4 border-[var(--border-strong)]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 bg-bauhaus-yellow border-4 border-[var(--border-strong)]"
        />
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 bg-bauhaus-blue border-4 border-[var(--border-strong)]"
        />
      </div>
      <p className="text-xl font-black text-primary uppercase tracking-widest">{text}</p>
    </div>
  )
}
// .
