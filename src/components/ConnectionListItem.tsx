import React, { JSX } from 'react'
import { UploaderConnection, UploaderConnectionStatus } from '../types'
import ProgressBar from './ProgressBar'

export function ConnectionListItem({
  conn,
}: {
  conn: UploaderConnection
}): JSX.Element {
  const getStatusColor = (status: UploaderConnectionStatus) => {
    switch (status) {
      case UploaderConnectionStatus.Uploading:
        return 'bg-[#2d9596] text-white'
      case UploaderConnectionStatus.Paused:
        return 'bg-[#d4a373] text-white'
      case UploaderConnectionStatus.Done:
        return 'bg-[#5a9e6f] text-white'
      case UploaderConnectionStatus.Closed:
        return 'bg-[#e05a4f] text-white'
      case UploaderConnectionStatus.InvalidPassword:
        return 'bg-[#e05a4f] text-white'
      default:
        return 'bg-[#a09a90] text-white'
    }
  }

  return (
    <div className="w-full mt-3 surface rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#3a3a36] dark:text-[#c0bdb8]">
            {conn.browserName && conn.browserVersion ? (
              <>
                {conn.browserName}{' '}
                <span className="text-[#a09a90] dark:text-[#5a5850] mono text-xs">
                  v{conn.browserVersion}
                </span>
              </>
            ) : (
              'Downloader'
            )}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md mono text-[9px] font-semibold ${getStatusColor(conn.status)}`}
          >
            {conn.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="text-xs text-[#8a8580] dark:text-[#6a6660] mono">
          <div>
            {conn.completedFiles}/{conn.totalFiles} files
          </div>
          {conn.uploadingFileName &&
            conn.status === UploaderConnectionStatus.Uploading && (
              <div>{Math.round(conn.currentFileProgress * 100)}%</div>
            )}
        </div>
      </div>
      <ProgressBar
        value={
          conn.completedFiles === conn.totalFiles
            ? 1
            : (conn.completedFiles + conn.currentFileProgress) / conn.totalFiles
        }
        max={1}
      />
    </div>
  )
}
