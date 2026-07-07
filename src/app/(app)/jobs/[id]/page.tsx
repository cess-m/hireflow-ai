import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteCandidateButton from '@/components/DeleteCandidateButton'
import DeleteJobButton from '@/components/DeleteJobButton'

type CandidateRow = {
  id: string
  candidate_name: string
  match_score: number | null
  recommendation: string | null
  status: string | null
  created_at: string
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: job } = await supabase
    .from('screenings')
    .select('id, job_title, job_description, created_at')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!job) notFound()

  const { data } = await supabase
    .from('candidates')
    .select('id, candidate_name, match_score, recommendation, status, created_at')
    .eq('screening_id', id)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const candidates = (data ?? []) as CandidateRow[]
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length
  const avgScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score ?? 0), 0) / candidates.length)
      : null

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard?tab=jobs" className="hover:text-slate-900 transition">Job Cards</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{job.job_title}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{job.job_title}</h1>
          <p className="text-sm text-slate-500 mt-1">Created {new Date(job.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <DeleteJobButton
            jobId={job.id}
            jobTitle={job.job_title}
            candidateCount={candidates.length}
            shortlistedCount={shortlisted}
          />
          <Link
            href={`/jobs/${job.id}/applicants/new`}
            className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Add Applicant
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric label="Applicants" value={candidates.length} />
        <Metric label="Avg Score" value={avgScore !== null ? `${avgScore}%` : 'N/A'} />
        <Metric label="Shortlisted" value={shortlisted} />
        <Metric label="Status" value="Active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ApplicantsTable candidates={candidates} jobId={job.id} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Job Requirements</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{job.job_description}</p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function ApplicantsTable({ candidates, jobId }: { candidates: CandidateRow[]; jobId: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Applicants</h2>
        <Link href={`/jobs/${jobId}/applicants/new`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          Add Applicant
        </Link>
      </div>
      {candidates.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-slate-500 text-sm mb-3">No applicants have been added to this job yet.</p>
          <Link href={`/jobs/${jobId}/applicants/new`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Add first applicant
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-3 md:px-6 py-3 text-left">Candidate</th>
                <th className="px-3 md:px-6 py-3 text-left">Score</th>
                <th className="px-3 md:px-6 py-3 text-left hidden md:table-cell">Recommendation</th>
                <th className="px-3 md:px-6 py-3 text-left">Status</th>
                <th className="px-3 md:px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 md:px-6 py-4 text-slate-900 font-medium">{candidate.candidate_name}</td>
                  <td className="px-3 md:px-6 py-4"><Score value={candidate.match_score} /></td>
                  <td className="px-3 md:px-6 py-4 text-slate-600 hidden md:table-cell">{candidate.recommendation ?? '-'}</td>
                  <td className="px-3 md:px-6 py-4"><StatusBadge status={candidate.status ?? 'pending'} /></td>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/screening/${candidate.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View
                      </Link>
                      <DeleteCandidateButton
                        candidateId={candidate.id}
                        candidateName={candidate.candidate_name}
                        isShortlisted={candidate.status === 'shortlisted'}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  return (
    <span className={`font-medium ${
      (value ?? 0) >= 70 ? 'text-emerald-700' : (value ?? 0) >= 50 ? 'text-amber-700' : 'text-red-700'
    }`}>
      {value ?? '-'}{value != null ? '%' : ''}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewed: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  const style = styles[status] ?? styles.pending
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}
