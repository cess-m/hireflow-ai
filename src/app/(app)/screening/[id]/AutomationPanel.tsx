'use client'

import { useState } from 'react'

interface Props {
  candidateId: string
  candidateStatus: string
  sheetUrl: string | null
}

export default function AutomationPanel({ candidateId, candidateStatus, sheetUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(candidateStatus === 'shortlisted')
  const [error, setError] = useState('')

  const handleSend = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidateId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Something went wrong' }))
        throw new Error(body.error ?? 'Something went wrong')
      }
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-950 mb-3">Automation</h3>
      {sent ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Shortlisted
            </span>
            <span className="text-xs text-slate-500">Sent to Google Sheets</span>
          </div>
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View Sheet
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Shortlist this candidate to trigger the n8n workflow and append them to Google Sheets.
          </p>
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send to n8n'}
          </button>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <p className="text-xs text-red-700">{error}</p>
              {(error.includes('Settings') || error.includes('connected') || error.includes('configured')) && (
                <a
                  href="/settings"
                  className="text-xs text-red-700 font-medium underline underline-offset-2 mt-1 inline-block hover:text-red-800"
                >
                  Go to Settings →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
