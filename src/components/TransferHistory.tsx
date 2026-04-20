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
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[var(--bauhaus-blue)] border-4 border-[var(--border-strong)] text-white hover:bg-[var(--bauhaus-red)] flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
        title="Transfer History"
      >
        <Database className="w-5 h-5" strokeWidth={3} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-4 border-[var(--border-strong)] bg-[var(--bauhaus-yellow)]">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={3} />
                <h2 className="text-lg font-black uppercase tracking-wider text-[var(--text-primary)]">Transfer History</h2>
                <span className="text-xs font-black text-[var(--text-primary)] bg-white border-2 border-[var(--border-strong)] px-2 py-0.5">{total} records</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { fetchTransfers(); fetchAnalytics() }}
                  className="p-2 text-[var(--text-primary)] hover:bg-white border-2 border-transparent hover:border-[var(--border-strong)] transition-all" title="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-[var(--text-primary)] hover:bg-[var(--bauhaus-red)] hover:text-white border-2 border-transparent hover:border-[var(--border-strong)] transition-all">
                  <X className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b-4 border-[var(--border-strong)]">
              {(['history', 'analytics'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                    tab === t
                      ? 'bg-[var(--text-primary)] text-white'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bauhaus-yellow)]'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
              {tab === 'history' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['', 'pending', 'active', 'completed', 'failed'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all border-4 ${
                          statusFilter === s
                            ? 'bg-[var(--text-primary)] text-white border-[var(--border-strong)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                            : 'bg-white text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--bauhaus-yellow)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                        }`}>
                        {s || 'All'}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border-4 border-[var(--border-strong)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-black uppercase tracking-widest">
                          <th className="text-left py-3 px-3 cursor-pointer hover:bg-[var(--bauhaus-yellow)] transition-colors border-b-4 border-[var(--border-strong)]" onClick={() => toggleSort('fileName')}>
                            <span className="flex items-center gap-1">File <ArrowUpDown className="w-3 h-3" strokeWidth={3} /></span>
                          </th>
                          <th className="text-right py-3 px-3 cursor-pointer hover:bg-[var(--bauhaus-yellow)] transition-colors border-b-4 border-[var(--border-strong)]" onClick={() => toggleSort('fileSize')}>
                            <span className="flex items-center gap-1 justify-end">Size <ArrowUpDown className="w-3 h-3" strokeWidth={3} /></span>
                          </th>
                          <th className="text-center py-3 px-3 border-b-4 border-[var(--border-strong)]">Status</th>
                          <th className="text-right py-3 px-3 cursor-pointer hover:bg-[var(--bauhaus-yellow)] transition-colors border-b-4 border-[var(--border-strong)]" onClick={() => toggleSort('startedAt')}>
                            <span className="flex items-center gap-1 justify-end">Date <ArrowUpDown className="w-3 h-3" strokeWidth={3} /></span>
                          </th>
                          <th className="text-right py-3 px-3 border-b-4 border-[var(--border-strong)]">Duration</th>
                          <th className="text-center py-3 px-3 w-10 border-b-4 border-[var(--border-strong)]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-8 text-[var(--text-muted)] font-bold uppercase tracking-widest">No transfers recorded yet</td></tr>
                        )}
                        {transfers.map(t => (
                          <tr key={t.id} className="border-b-2 border-[var(--border-strong)] last:border-b-0 hover:bg-[var(--bauhaus-yellow)] transition-colors">
                            <td className="py-3 px-3">
                              <div className="text-[var(--text-primary)] font-bold truncate max-w-[200px]">{t.fileName}</div>
                              <div className="text-[var(--text-muted)] text-xs font-mono">{t.fileType}</div>
                            </td>
                            <td className="py-3 px-3 text-right text-[var(--text-secondary)] font-mono text-xs font-bold">{formatBytes(t.fileSize)}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-4 ${
                                t.status === 'completed' ? 'bg-[var(--bauhaus-blue)] text-white border-[var(--border-strong)]'
                                : t.status === 'active' ? 'bg-[var(--bauhaus-yellow)] text-[var(--text-primary)] border-[var(--border-strong)]'
                                : t.status === 'failed' ? 'bg-[var(--bauhaus-red)] text-white border-[var(--border-strong)]'
                                : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-[var(--text-muted)] text-xs font-bold">{formatDate(t.startedAt)}</td>
                            <td className="py-3 px-3 text-right text-[var(--text-muted)] text-xs font-mono font-bold">
                              {t.durationMs ? formatDuration(t.durationMs) : '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button onClick={() => deleteTransfer(t.id)}
                                className="text-[var(--text-muted)] hover:text-white hover:bg-[var(--bauhaus-red)] border-2 border-transparent hover:border-[var(--border-strong)] transition-all p-1">
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={3} />
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
                      { label: 'Total Transfers', value: analytics.overview.totalTransfers, color: 'bg-[var(--bauhaus-yellow)]' },
                      { label: 'Completed', value: analytics.overview.completedTransfers, color: 'bg-[var(--bauhaus-blue)] text-white' },
                      { label: 'Rooms Created', value: analytics.overview.totalRooms, color: 'bg-[var(--bauhaus-red)] text-white' },
                      { label: 'Data Transferred', value: formatBytes(analytics.overview.totalFileSize), color: 'bg-white' },
                    ].map(card => (
                      <div key={card.label} className={`${card.color} border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4 hover:-translate-y-1 transition-transform`}>
                        <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">{card.label}</div>
                        <div className="text-2xl font-black font-mono">{card.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Transfer speed stats */}
                  <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4">
                    <div className="text-xs font-black uppercase tracking-widest mb-3 text-[var(--text-primary)]">Transfer Duration</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[var(--bauhaus-yellow)] border-4 border-[var(--border-strong)] p-3">
                        <div className="text-xs font-black uppercase">Average</div>
                        <div className="text-lg font-black font-mono">{formatDuration(analytics.avgDuration.avg)}</div>
                      </div>
                      <div className="bg-[var(--bg-elevated)] border-4 border-[var(--border-strong)] p-3">
                        <div className="text-xs font-black uppercase">Fastest</div>
                        <div className="text-lg font-black font-mono">{formatDuration(analytics.avgDuration.min)}</div>
                      </div>
                      <div className="bg-[var(--bg-elevated)] border-4 border-[var(--border-strong)] p-3">
                        <div className="text-xs font-black uppercase">Slowest</div>
                        <div className="text-lg font-black font-mono">{formatDuration(analytics.avgDuration.max)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4">
                    <div className="text-xs font-black uppercase tracking-widest mb-3 text-[var(--text-primary)]">By Status</div>
                    <div className="space-y-2">
                      {analytics.transfersByStatus.map(s => {
                        const pct = analytics.overview.totalTransfers > 0
                          ? (s.count / analytics.overview.totalTransfers) * 100 : 0
                        return (
                          <div key={s.status} className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase w-20 text-[var(--text-primary)]">{s.status}</span>
                            <div className="flex-1 h-4 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] overflow-hidden">
                              <div className="h-full bg-[var(--bauhaus-red)] transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-black text-[var(--text-primary)] font-mono w-8 text-right">{s.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top file types */}
                  <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4">
                    <div className="text-xs font-black uppercase tracking-widest mb-3 text-[var(--text-primary)]">Top File Types</div>
                    {analytics.topFileTypes.length === 0 && (
                      <p className="text-[var(--text-muted)] text-sm font-bold">No data yet</p>
                    )}
                    <div className="space-y-2">
                      {analytics.topFileTypes.map(t => (
                        <div key={t.type} className="flex items-center justify-between border-b-2 border-[var(--border-strong)] last:border-b-0 py-2">
                          <span className="text-xs font-black font-mono text-[var(--text-primary)] bg-[var(--bauhaus-yellow)] border-2 border-[var(--border-strong)] px-2 py-0.5">{t.type}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[var(--text-muted)]">{t.count} files</span>
                            <span className="text-xs font-bold font-mono text-[var(--text-primary)]">{formatBytes(t.totalSize)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'analytics' && !analytics && (
                <div className="text-center py-12 text-[var(--text-muted)] font-black uppercase tracking-widest">Loading analytics...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  )
}
// .
