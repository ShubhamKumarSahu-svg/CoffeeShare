'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Database, ArrowUpDown, Trash2, RefreshCw } from 'lucide-react'

type Transfer = {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  status: string
  startedAt: string
  completedAt: string | null
  durationMs: number | null
  bytesTransferred: number
  room: { roomCode: string } | null
}

type Analytics = {
  overview: {
    totalTransfers: number
    completedTransfers: number
    totalRooms: number
    totalParticipants: number
    totalBytesTransferred: number
    totalFileSize: number
  }
  transfersByStatus: { status: string; count: number }[]
  avgDuration: { avg: number; min: number; max: number }
  topFileTypes: { type: string; count: number; totalSize: number }[]
  recentTransfers: Transfer[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function TransferHistory() {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'history' | 'analytics'>('history')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('startedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchTransfers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy, sortOrder, limit: '50', offset: '0',
      })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/transfers?${params}`)
      const data = await res.json()
      setTransfers(data.transfers || [])
      setTotal(data.total || 0)
    } catch (e) { console.error('Failed to fetch transfers', e) }
    setLoading(false)
  }, [sortBy, sortOrder, statusFilter])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (e) { console.error('Failed to fetch analytics', e) }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    fetchTransfers()
    fetchAnalytics()
  }, [isOpen, fetchTransfers, fetchAnalytics])

  const deleteTransfer = async (id: string) => {
    await fetch(`/api/transfers/${id}`, { method: 'DELETE' })
    fetchTransfers()
    fetchAnalytics()
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('desc') }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:border-stone-500 flex items-center justify-center transition-colors shadow-lg"
        title="Transfer History"
      >
        <Database className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-stone-400" />
                <h2 className="text-lg font-bold text-white">Transfer History</h2>
                <span className="text-xs text-stone-500 font-mono">{total} records</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { fetchTransfers(); fetchAnalytics() }}
                  className="p-2 text-stone-500 hover:text-white transition-colors" title="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-stone-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-800">
              {(['history', 'analytics'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    tab === t ? 'text-white border-b-2 border-white' : 'text-stone-500 hover:text-stone-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'history' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['', 'pending', 'active', 'completed', 'failed'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          statusFilter === s
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'bg-stone-800 text-stone-500 border border-stone-700 hover:text-stone-300'
                        }`}>
                        {s || 'All'}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-stone-500 text-xs uppercase tracking-wider">
                          <th className="text-left py-2 px-2 cursor-pointer hover:text-white" onClick={() => toggleSort('fileName')}>
                            <span className="flex items-center gap-1">File <ArrowUpDown className="w-3 h-3" /></span>
                          </th>
                          <th className="text-right py-2 px-2 cursor-pointer hover:text-white" onClick={() => toggleSort('fileSize')}>
                            <span className="flex items-center gap-1 justify-end">Size <ArrowUpDown className="w-3 h-3" /></span>
                          </th>
                          <th className="text-center py-2 px-2">Status</th>
                          <th className="text-right py-2 px-2 cursor-pointer hover:text-white" onClick={() => toggleSort('startedAt')}>
                            <span className="flex items-center gap-1 justify-end">Date <ArrowUpDown className="w-3 h-3" /></span>
                          </th>
                          <th className="text-right py-2 px-2">Duration</th>
                          <th className="text-center py-2 px-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-8 text-stone-600">No transfers recorded yet</td></tr>
                        )}
                        {transfers.map(t => (
                          <tr key={t.id} className="border-t border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="text-stone-200 font-medium truncate max-w-[200px]">{t.fileName}</div>
                              <div className="text-stone-600 text-xs font-mono">{t.fileType}</div>
                            </td>
                            <td className="py-2.5 px-2 text-right text-stone-400 font-mono text-xs">{formatBytes(t.fileSize)}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                t.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : t.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : t.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-stone-700/50 text-stone-400 border border-stone-600'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right text-stone-500 text-xs">{formatDate(t.startedAt)}</td>
                            <td className="py-2.5 px-2 text-right text-stone-500 text-xs font-mono">
                              {t.durationMs ? formatDuration(t.durationMs) : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button onClick={() => deleteTransfer(t.id)}
                                className="text-stone-600 hover:text-red-400 transition-colors p-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'analytics' && analytics && (
                <div className="space-y-6">
                  {/* Overview cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Transfers', value: analytics.overview.totalTransfers },
                      { label: 'Completed', value: analytics.overview.completedTransfers },
                      { label: 'Rooms Created', value: analytics.overview.totalRooms },
                      { label: 'Data Transferred', value: formatBytes(analytics.overview.totalFileSize) },
                    ].map(card => (
                      <div key={card.label} className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">{card.label}</div>
                        <div className="text-2xl font-black text-white font-mono">{card.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Transfer speed stats */}
                  <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">Transfer Duration</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-stone-600 text-xs">Average</div>
                        <div className="text-lg font-bold text-white font-mono">{formatDuration(analytics.avgDuration.avg)}</div>
                      </div>
                      <div>
                        <div className="text-stone-600 text-xs">Fastest</div>
                        <div className="text-lg font-bold text-stone-300 font-mono">{formatDuration(analytics.avgDuration.min)}</div>
                      </div>
                      <div>
                        <div className="text-stone-600 text-xs">Slowest</div>
                        <div className="text-lg font-bold text-stone-300 font-mono">{formatDuration(analytics.avgDuration.max)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">By Status (GROUP BY)</div>
                    <div className="space-y-2">
                      {analytics.transfersByStatus.map(s => {
                        const pct = analytics.overview.totalTransfers > 0
                          ? (s.count / analytics.overview.totalTransfers) * 100 : 0
                        return (
                          <div key={s.status} className="flex items-center gap-3">
                            <span className="text-xs text-stone-400 w-20 capitalize">{s.status}</span>
                            <div className="flex-1 h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div className="h-full bg-white/40 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-stone-500 font-mono w-8 text-right">{s.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top file types */}
                  <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">Top File Types (GROUP BY + SUM)</div>
                    {analytics.topFileTypes.length === 0 && (
                      <p className="text-stone-600 text-sm">No data yet</p>
                    )}
                    <div className="space-y-2">
                      {analytics.topFileTypes.map(t => (
                        <div key={t.type} className="flex items-center justify-between">
                          <span className="text-xs text-stone-300 font-mono">{t.type}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-500">{t.count} files</span>
                            <span className="text-xs text-stone-500 font-mono">{formatBytes(t.totalSize)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'analytics' && !analytics && (
                <div className="text-center py-12 text-stone-600">Loading analytics...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  )
}
