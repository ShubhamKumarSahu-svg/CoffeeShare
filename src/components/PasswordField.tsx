import React, { JSX, useCallback } from 'react'
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
  const handleChange = useCallback(
    function (e: React.ChangeEvent<HTMLInputElement>): void {
      onChange(e.target.value)
    },
    [onChange],
  )

  return (
    <div className="flex flex-col w-full">
      <InputLabel
        hasError={isInvalid}
        tooltip="The downloader must provide this password to start downloading the file. If you don't specify a password here, any downloader with the link to the file will be able to download it. It is not used to encrypt the file, as this is performed by WebRTC's DTLS already."
      >
        {isRequired ? 'Password' : 'Password (optional)'}
      </InputLabel>
      <input
        autoFocus
        type="password"
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d9596]/30 focus:border-[#2d9596] ${
          isInvalid
            ? 'border-[#e05a4f]'
            : 'border-[#e8e4dd] dark:border-[#2a2a27]'
        } bg-[#fffdf9] dark:bg-[#1a1a18] text-[#2c2c2c] dark:text-[#e0ddd8] transition-all duration-200 text-sm`}
        placeholder="Enter a secret password for this share..."
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
