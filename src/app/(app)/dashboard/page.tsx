import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import DeleteCandidateButton from '@/components/DeleteCandidateButton'

type CandidateRow = {
  id: string
  candidate_name: string
  match_score: number | null
  status: string | null
  created_at: string
  screening_id: string
  screenings: { job_title: string } | { job_title: string }[] | null
}

type JobRow = {
  id: string
  job_title: string
  job_description: string
  created_at: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const activeTab = params?.tab === 'jobs' || params?.tab === 'applicants' ? params.tab : 'overview'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [jobsRes, candidatesRes, logsRes] = await Promise.all([
    supabase
      .from('screenings')
      .select('id, job_title, job_description, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('candidates')
      .select('id, candidate_name, match_score, status, created_at, screening_id, screenings!screening_id(job_title)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('automation_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
  ])

  const jobs = (jobsRes.data ?? []) as JobRow[]
  const candidates = (candidatesRes.data ?? []) as unknown as CandidateRow[]
  const totalAutomation = logsRes.count ?? 0
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length
  const avgScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce((sum: number, c) => sum + (c.match_score ?? 0), 0) / candidates.length
        )
      : null

  const metrics = [
    { label: 'Completed Screenings', value: candidates.length, accent: 'border-t-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Active Job Cards', value: jobs.length, accent: 'border-t-slate-400', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
    { label: 'Shortlisted', value: shortlisted, accent: 'border-t-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : 'N/A', accent: 'border-t-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ]

  const tabs = [
    { label: 'Overview', value: 'overview', href: '/dashboard' },
    { label: 'Job Cards', value: 'jobs', href: '/dashboard?tab=jobs' },
    { label: 'Recent Applicants', value: 'applicants', href: '/dashboard?tab=applicants' },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Review job cards, applicants, and screening activity.</p>
        </div>
        <Link
          href="/jobs/new"
          className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 sm:px-5 sm:py-2 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap"
        >
          Create Job
        </Link>
      </div>

      <div className="border-b border-slate-200 mb-6 overflow-x-auto">
        <nav className="flex gap-6 whitespace-nowrap min-w-max">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <OverviewTab metrics={metrics} candidates={candidates.slice(0, 8)} totalAutomation={totalAutomation} />
      )}

      {activeTab === 'jobs' && (
        <JobsTab jobs={jobs} candidates={candidates} />
      )}

      {activeTab === 'applicants' && (
        <ApplicantsTable candidates={candidates} title="Recent Applicants" emptyText="No applicants have been screened yet." />
      )}
    </div>
  )
}

function OverviewTab({
  metrics,
  candidates,
  totalAutomation,
}: {
  metrics: { label: string; value: string | number; accent: string }[]
  candidates: CandidateRow[]
  totalAutomation: number
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{m.label}</p>
            <p className="text-3xl font-bold text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <ApplicantsTable candidates={candidates} title="Recent Activity" emptyText="No screening activity yet." />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Automation Runs</p>
          <p className="text-2xl font-semibold text-slate-950">{totalAutomation}</p>
          <p className="text-xs text-slate-500 mt-3">
            n8n logs will appear after the shortlist workflow is connected.
          </p>
        </div>
      </div>
    </div>
  )
}

function JobsTab({ jobs, candidates }: { jobs: JobRow[]; candidates: CandidateRow[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No job cards yet."
        description="Create a job card first, then add applicants under that role."
        actionHref="/jobs/new"
        actionLabel="Create Job"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {jobs.map((job) => {
        const jobCandidates = candidates.filter((c) => c.screening_id === job.id)
        const shortlisted = jobCandidates.filter((c) => c.status === 'shortlisted').length
        const avgScore =
          jobCandidates.length > 0
            ? Math.round(jobCandidates.reduce((sum, c) => sum + (c.match_score ?? 0), 0) / jobCandidates.length)
            : null

        return (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-950">{job.job_title}</h2>
                <p className="text-xs text-slate-500 mt-1">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                Open
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-4 line-clamp-3">{job.job_description}</p>
            <div className="grid grid-cols-3 gap-3 mt-5 text-xs">
              <Metric label="Applicants" value={jobCandidates.length} />
              <Metric label="Avg Score" value={avgScore !== null ? `${avgScore}%` : '-'} />
              <Metric label="Shortlisted" value={shortlisted} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ApplicantsTable({
  candidates,
  title,
  emptyText,
}: {
  candidates: CandidateRow[]
  title: string
  emptyText: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      {candidates.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-slate-500 text-sm mb-3">{emptyText}</p>
          <Link
            href="/jobs/new"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            Create a job card
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="px-3 md:px-6 py-3 text-left font-medium">Candidate</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium hidden sm:table-cell">Job Title</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium">Score</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium">Status</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium hidden md:table-cell">Date</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-3 md:px-6 py-3 text-slate-950 font-medium">{c.candidate_name}</td>
                  <td className="px-3 md:px-6 py-3 text-slate-600 hidden sm:table-cell">{getJobTitle(c.screenings)}</td>
                  <td className="px-3 md:px-6 py-3">
                    <Score value={c.match_score} />
                  </td>
                  <td className="px-3 md:px-6 py-3">
                    <StatusBadge status={c.status ?? 'pending'} />
                  </td>
                  <td className="px-3 md:px-6 py-3 text-slate-500 hidden md:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-3 md:px-6 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/screening/${c.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium cursor-pointer">
                        View
                      </Link>
                      <DeleteCandidateButton
                        candidateId={c.id}
                        candidateName={c.candidate_name}
                        isShortlisted={c.status === 'shortlisted'}
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-950 mt-0.5">{value}</p>
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  return (
    <span
      className={`font-medium ${
        (value ?? 0) >= 70
          ? 'text-emerald-700'
          : (value ?? 0) >= 50
          ? 'text-amber-700'
          : 'text-red-700'
      }`}
    >
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

function getJobTitle(screening: CandidateRow['screenings']): string {
  if (Array.isArray(screening)) return screening[0]?.job_title ?? '-'
  return screening?.job_title ?? '-'
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center shadow-sm">
      <p className="text-slate-950 font-medium">{title}</p>
      <p className="text-slate-500 text-sm mt-1 mb-4">{description}</p>
      <Link href={actionHref} className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
        {actionLabel}
      </Link>
    </div>
  )
}
