'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function CreateJobPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const canCreate = jobTitle.trim() && jobDescription.trim()

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: job, error: insertErr } = await supabase
        .from('screenings')
        .insert({ user_id: user!.id, job_title: jobTitle, job_description: jobDescription })
        .select()
        .single()

      if (insertErr) throw new Error(insertErr.message)

      router.push(`/jobs/${job.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-950">Create Job</h1>
        <p className="text-sm text-slate-500 mt-1">Create a job card first, then add applicants under that role.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm max-w-4xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 block mb-1">Job title *</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Digital Marketing Specialist"
              className="field-input"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">Job description *</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={18}
              className="field-input resize-none"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleCreate}
          disabled={!canCreate || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Job...' : 'Create Job'}
        </button>
        {!canCreate && !loading && (
          <p className="text-xs text-slate-500">Add a job title and job description to continue.</p>
        )}
      </div>
    </div>
  )
}
