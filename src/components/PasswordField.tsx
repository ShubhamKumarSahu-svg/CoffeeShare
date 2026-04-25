import React, { JSX, useCallback, useMemo, useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import InputLabel from './InputLabel'

export default function PasswordField({
  value,
  onChange,
  isRequired = false,
  isInvalid = false,
}: {
  value: string
  onChange: (v: string) => void
  isRequired?: boolean
  isInvalid?: boolean
}): JSX.Element {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = useCallback(
    function (e: React.ChangeEvent<HTMLInputElement>): void {
      onChange(e.target.value)
    },
    [onChange],
  )

  const strength = useMemo(() => {
    if (!value) return 0
    let score = 0
    if (value.length >= 8) score += 1
    if (/[A-Z]/.test(value)) score += 1
    if (/[0-9]/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1
    return score
  }, [value])

  const strengthLabel = ['Weak', 'Weak', 'Fair', 'Strong', 'Very strong'][strength]

  return (
    <div className="flex flex-col w-full">
      <InputLabel
        hasError={isInvalid}
        tooltip="The downloader must provide this password to start downloading the file. If you don't specify a password here, any downloader with the link to the file will be able to download it. It is not used to encrypt the file, as this is performed by WebRTC's DTLS already."
      >
        {isRequired ? 'Password' : 'Password (optional)'}
      </InputLabel>
      <div className="relative">
        <input
          autoFocus
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
            isInvalid ? 'border-[var(--danger)]' : 'border-[var(--border-subtle)]'
          } bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-all duration-200 text-sm`}
          placeholder="Enter a secret password for this share..."
          value={value}
          onChange={handleChange}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Password strength
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            {value ? strengthLabel : 'Not set'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full ${
                strength > index ? 'bg-[var(--brand)]' : 'bg-[var(--bg-muted)]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
