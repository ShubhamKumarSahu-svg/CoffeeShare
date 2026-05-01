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
  const strengthColor = ['bg-[var(--bg-elevated)]', 'bg-bauhaus-red', 'bg-bauhaus-yellow', 'bg-bauhaus-blue', 'bg-bauhaus-blue'][strength]

  return (
    <div className="flex flex-col w-full mt-4">
      <InputLabel
        hasError={isInvalid}
        tooltip="The downloader must provide this password to start downloading the file. If you don't specify a password here, any downloader with the link to the file will be able to download it. It is not used to encrypt the file, as this is performed by WebRTC's DTLS already."
      >
        {isRequired ? 'Password' : 'Password (optional)'}
      </InputLabel>
      <div className="relative mt-2">
        <input
          autoFocus
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-5 py-4 pr-12 border-4 focus:outline-none shadow-[4px_4px_0px_0px_var(--shadow-color)] ${
            isInvalid ? 'border-bauhaus-red' : 'border-[var(--border-strong)]'
          } bg-white text-primary transition-all duration-200 text-base font-bold focus:border-bauhaus-blue placeholder:text-primary/40`}
          placeholder="Enter a secret password for this share..."
          value={value}
          onChange={handleChange}
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff className="w-6 h-6" strokeWidth={3} /> : <Eye className="w-6 h-6" strokeWidth={3} />}
        </button>
      </div>

      <div className="mt-6 border-4 border-[var(--border-strong)] bg-white p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-primary uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-0.5">
            Password strength
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={3} />
            {value ? strengthLabel : 'Not set'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-3 border-2 border-[var(--border-strong)] ${
                strength > index ? strengthColor : 'bg-[var(--bg-elevated)]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
// .
// .
// .
// .
// .
