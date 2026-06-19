'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  job_title: string
  job_description: string
}

type ExtractPdfResponse = {
  text?: string
  candidate_name?: string
  candidate_email?: string
  text_length?: number
  error?: string
}

export default function AddApplicantForm({ job }: { job: Job }) {
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [pdfMessage, setPdfMessage] = useState('')
  const router = useRouter()

  const canRun = candidateName.trim() && resumeText.trim()

  const handlePdfUpload = async (file: File | undefined) => {
    if (!file) return

    setError('')
    setPdfMessage('')

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }

    setExtracting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as ExtractPdfResponse
      if (!res.ok) throw new Error(data.error || 'Failed to extract PDF text')
      if (!data.text) throw new Error('No resume text was extracted from this PDF.')

      setResumeText(data.text)
      let foundFields = 0
      if (!candidateName.trim() && data.candidate_name) {
        setCandidateName(data.candidate_name)
        foundFields += 1
      }
      if (!candidateEmail.trim() && data.candidate_email) {
        setCandidateEmail(data.candidate_email)
        foundFields += 1
      }

      const details = foundFields > 0 ? ` Found ${foundFields === 2 ? 'name and email' : 'candidate detail'}.` : ''
      setPdfMessage(`PDF extracted.${details} Review before screening.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to extract PDF text')
    } finally {
      setExtracting(false)
    }
  }

  const handleRun = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screening_id: job.id,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          resume_text: resumeText,
          job_title: job.job_title,
          job_description: job.job_description,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Screening failed')
      }

      const candidate = await res.json()
      router.push(`/screening/${candidate.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-950 mb-4">Candidate</h2>
            <div className="space-y-3">
              <Field label="Full name *">
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Ana Cruz"
                  className="field-input"
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. ana@example.com"
                  className="field-input"
                />
              </Field>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-950">Resume *</h2>
              <label className={`text-xs border px-2 py-1 rounded transition ${
                extracting
                  ? 'text-slate-400 border-slate-200 bg-slate-50 cursor-wait'
                  : 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer'
              }`}>
                {extracting ? 'Extracting PDF...' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={extracting || loading}
                  className="sr-only"
                  onChange={(e) => {
                    void handlePdfUpload(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the candidate resume text here..."
              rows={18}
              className="field-input resize-none"
            />
            {pdfMessage && (
              <p className="mt-2 text-xs text-emerald-700">{pdfMessage}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Text-based PDFs can be extracted automatically. If extraction looks incomplete, paste the resume text manually.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-950 mb-3">Screening Against</h2>
          <p className="font-medium text-slate-950">{job.job_title}</p>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mt-4">{job.job_description}</p>
        </div>
      </div>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleRun}
          disabled={!canRun || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running AI Screening...' : 'Run AI Screening'}
        </button>
        {!canRun && !loading && (
          <p className="text-xs text-slate-500">Add a candidate name and resume to continue.</p>
        )}
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}
