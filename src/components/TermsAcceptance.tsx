'use client'

import { JSX, useState } from 'react'
import CancelButton from './CancelButton'

export default function TermsAcceptance(): JSX.Element {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex justify-center">
        <span className="text-xs text-[#a09a90] dark:text-[#5a5850]">
          By selecting a file, you agree to{' '}
          <button
            onClick={() => setShowModal(true)}
            className="underline accent-text hover:text-[#268080] dark:hover:text-[#5cc5c6] transition-colors duration-200"
            aria-label="View upload terms"
          >
            our terms
          </button>
          .
        </span>
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
              PizzaShare Terms
            </h2>

            <div className="space-y-3 text-[#5a5550] dark:text-[#9a9690]">
              <ul className="list-none space-y-2">
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c]">
                  <span className="text-sm">📤</span>
                  <span className="text-sm">
                    Files are shared directly between browsers — no server
                    storage
                  </span>
                </li>
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c]">
                  <span className="text-sm">✅</span>
                  <span className="text-sm">
                    Only upload files you have the right to share
                  </span>
                </li>
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c]">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm">
                    Share download links only with known recipients
                  </span>
                </li>
                <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c]">
                  <span className="text-sm">⚠️</span>
                  <span className="text-sm">
                    No illegal or harmful content allowed
                  </span>
                </li>
              </ul>

              <p className="text-xs italic text-[#a09a90] dark:text-[#5a5850]">
                By uploading a file, you confirm that you understand and agree
                to these terms.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <CancelButton
                text="Got it!"
                onClick={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
