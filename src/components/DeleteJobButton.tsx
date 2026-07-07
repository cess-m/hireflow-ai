'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DeleteJobButton({
  jobId,
  jobTitle,
  candidateCount,
  shortlistedCount,
}: {
  jobId: string
  jobTitle: string
  candidateCount: number
  shortlistedCount: number
}) {
  const [state, setState] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const router = useRouter()

  const handleDelete = async () => {
    setState('deleting')
    const supabase = createClient()
    await supabase.from('candidates').delete().eq('screening_id', jobId)
    await supabase.from('screenings').delete().eq('id', jobId)
    router.push('/dashboard?tab=jobs')
  }

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('confirm')}
        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-150 cursor-pointer"
      >
        Delete job
      </button>
    )
  }

  if (state === 'deleting') {
    return <span className="text-sm text-slate-400">Deleting...</span>
  }

  return (
    <div className="flex flex-col items-end gap-2 max-w-xs text-right">
      <p className="text-xs text-slate-600 leading-snug">
        Permanently delete <span className="font-medium">{jobTitle}</span>
        {candidateCount > 0 && (
          <> and all {candidateCount} candidate result{candidateCount !== 1 ? 's' : ''}</>
        )}?
        {shortlistedCount > 0 && (
          <span className="text-amber-600 block mt-1">
            {shortlistedCount} shortlisted candidate{shortlistedCount !== 1 ? 's were' : ' was'} sent to Google Sheets and will remain there.
          </span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setState('idle')}
          className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="text-xs bg-red-500 hover:bg-red-600 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
