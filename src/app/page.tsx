'use client'

import React, { JSX, useCallback, useState } from 'react'
import WebRTCPeerProvider from '../components/WebRTCProvider'
import DropZone from '../components/DropZone'
import UploadFileList from '../components/UploadFileList'
import Uploader from '../components/Uploader'
import PasswordField from '../components/PasswordField'
import StartButton from '../components/StartButton'
import { UploadedFile } from '../types'
import Spinner from '../components/Spinner'
import Wordmark from '../components/Wordmark'
import CancelButton from '../components/CancelButton'
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFileName } from '../fs'
import TitleText from '../components/TitleText'
import SubtitleText from '../components/SubtitleText'
import { pluralize } from '../utils/pluralize'
import TermsAcceptance from '../components/TermsAcceptance'
import AddFilesButton from '../components/AddFilesButton'

function PageWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col items-center space-y-6 py-14 max-w-xl mx-auto px-5 animate-fade-in">
      <Spinner direction="up" />
      <Wordmark />
      {children}
    </div>
  )
}

function InitialState({
  onDrop,
}: {
  onDrop: (files: UploadedFile[]) => void
}): JSX.Element {
  return (
    <>
      <div className="flex flex-col items-center space-y-3 max-w-sm">
        <TitleText>Brew & share files, peer-to-peer.</TitleText>
        <SubtitleText>
          No servers. No limits. Files go directly from your browser to theirs.
        </SubtitleText>
      </div>
      <DropZone onDrop={onDrop} />
      <TermsAcceptance />
    </>
  )
}

function useUploaderFileListData(uploadedFiles: UploadedFile[]) {
  return useMemo(() => {
    return uploadedFiles.map((item) => ({
      fileName: getFileName(item),
      type: item.type,
    }))
  }, [uploadedFiles])
}

function ConfirmUploadState({
  uploadedFiles,
  password,
  onChangePassword,
  onCancel,
  onStart,
  onRemoveFile,
  onAddFiles,
  burnAfterReading,
  onToggleBurn,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  onChangePassword: (pw: string) => void
  onCancel: () => void
  onStart: () => void
  onRemoveFile: (index: number) => void
  onAddFiles: (files: UploadedFile[]) => void
  burnAfterReading: boolean
  onToggleBurn: () => void
}): JSX.Element {
  const fileListData = useUploaderFileListData(uploadedFiles)
  return (
    <>
      <TitleText>
        You are about to share{' '}
        {pluralize(uploadedFiles.length, 'file', 'files')}.{' '}
        <AddFilesButton onAdd={onAddFiles} />
      </TitleText>
      <UploadFileList files={fileListData} onRemove={onRemoveFile} />
      <PasswordField value={password} onChange={onChangePassword} />

      <div
        className="flex items-center space-x-2 w-full justify-center mt-2 cursor-pointer"
        onClick={onToggleBurn}
      >
        <input
          type="checkbox"
          checked={burnAfterReading}
          readOnly
          className="w-4 h-4 text-[#F59E0B] bg-transparent border-stone-700 rounded focus:ring-[#F59E0B]"
        />
        <label className="text-sm font-medium text-stone-400 cursor-pointer select-none">
          Burn after pouring (Close link after 1 download)
        </label>
      </div>

      <div className="flex gap-3">
        <CancelButton onClick={onCancel} />
        <StartButton onClick={onStart} />
      </div>
    </>
  )
}

function UploadingState({
  uploadedFiles,
  password,
  burnAfterReading,
  onStop,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  burnAfterReading: boolean
  onStop: () => void
}): JSX.Element {
  return (
    <>
      <TitleText>
        You are sharing {pluralize(uploadedFiles.length, 'file', 'files')}.
      </TitleText>
      <SubtitleText>
        Keep this tab open. CoffeeShare transfers files directly — nothing is
        stored.
      </SubtitleText>
      <WebRTCPeerProvider>
        <Uploader
          files={uploadedFiles}
          password={password}
          burnAfterReading={burnAfterReading}
          onStop={onStop}
        />
      </WebRTCPeerProvider>
    </>
  )
}

export default function UploadPage(): JSX.Element {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [burnAfterReading, setBurnAfterReading] = useState(false)

  const handleDrop = useCallback((files: UploadedFile[]): void => {
    setUploadedFiles(files)
  }, [])

  const handleChangePassword = useCallback((pw: string) => {
    setPassword(pw)
  }, [])

  const handleStart = useCallback(() => {
    setUploading(true)
  }, [])

  const handleToggleBurn = useCallback(() => {
    setBurnAfterReading((b) => !b)
  }, [])

  const handleStop = useCallback(() => {
    setUploading(false)
  }, [])

  const handleCancel = useCallback(() => {
    setUploadedFiles([])
    setUploading(false)
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((fs) => fs.filter((_, i) => i !== index))
  }, [])

  const handleAddFiles = useCallback((files: UploadedFile[]) => {
    setUploadedFiles((fs) => [...fs, ...files])
  }, [])

  return (
    <PageWrapper>
      <AnimatePresence mode="popLayout">
        {!uploadedFiles.length ? (
          <motion.div
            key="initial"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <InitialState onDrop={handleDrop} />
          </motion.div>
        ) : !uploading ? (
          <motion.div
            key="confirm"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <ConfirmUploadState
              uploadedFiles={uploadedFiles}
              password={password}
              onChangePassword={handleChangePassword}
              onCancel={handleCancel}
              onStart={handleStart}
              onRemoveFile={handleRemoveFile}
              onAddFiles={handleAddFiles}
              burnAfterReading={burnAfterReading}
              onToggleBurn={handleToggleBurn}
            />
          </motion.div>
        ) : (
          <motion.div
            key="uploading"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <UploadingState
              uploadedFiles={uploadedFiles}
              password={password}
              burnAfterReading={burnAfterReading}
              onStop={handleStop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
