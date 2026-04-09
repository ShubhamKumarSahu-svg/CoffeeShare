'use client'

import { JSX } from 'react'
import { useWebRTCPeer } from './WebRTCProvider'
import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import CancelButton from './CancelButton'

export default function ReportTermsViolationButton({
  uploaderPeerID,
  slug,
}: {
  uploaderPeerID: string
  slug: string
}): JSX.Element {
  const { peer } = useWebRTCPeer()
  const [showModal, setShowModal] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!response.ok) {
        throw new Error('Failed to report violation')
      }
      return response.json()
    },
  })

  const handleReport = useCallback(() => {
    try {
      setIsReporting(true)
      reportMutation.mutate()

      const conn = peer.connect(uploaderPeerID, {
        metadata: { type: 'report' },
      })

      const timeout = setTimeout(() => {
        conn.close()
        window.location.href = '/reported'
      }, 2000)

      conn.on('open', () => {
        clearTimeout(timeout)
        conn.close()
        window.location.href = '/reported'
      })
    } catch (error) {
      console.error('Failed to report violation', error)
      setIsReporting(false)
    }
  }, [peer, uploaderPeerID])

  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-[#c0bbb3] dark:text-[#4a4a44] hover:text-[#e05a4f] hover:underline transition-colors duration-200"
          aria-label="Report terms violation"
        >
          Report suspicious share
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-[#2c2c2c]/40 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="surface rounded-2xl p-8 max-w-md w-full shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="modal-title"
              className="text-lg font-bold mb-4 text-[#2c2c2c] dark:text-[#e0ddd8]"
            >
              Found a suspicious share?
            </h2>

            <div className="space-y-3 text-[#5a5550] dark:text-[#9a9690]">
              <p className="text-sm">
                Before reporting, please note our PizzaShare terms:
              </p>

              <ul className="list-none space-y-2">
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
                  <span>✅</span>
                  <span>Only upload files you have the right to share</span>
                </li>
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
                  <span>🔒</span>
                  <span>Share download links only with known recipients</span>
                </li>
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
                  <span>⚠️</span>
                  <span>No illegal or harmful content allowed</span>
                </li>
              </ul>

              <p className="text-sm">
                If you&apos;ve spotted a violation, click Report to halt it.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <CancelButton onClick={() => setShowModal(false)} />
              <button
                disabled={isReporting}
                onClick={handleReport}
                className="px-5 py-2.5 bg-[#e05a4f] text-white rounded-xl hover:bg-[#c9504a] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirm report"
              >
                {isReporting ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
