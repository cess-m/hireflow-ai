import { createClient } from '@/lib/supabase-server'

type WorkflowResponse = {
  match_path?: string
  message?: string
  notification_sent?: boolean
}

export default async function AutomationLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: logs } = await supabase
    .from('automation_logs')
    .select('*, candidates!candidate_id(candidate_name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const totalRuns = logs?.length ?? 0
  const successCount = logs?.filter((l) => l.status === 'success').length ?? 0
  const failedCount = logs?.filter((l) => l.status === 'failed').length ?? 0

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Automation Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Track shortlist workflow attempts and n8n responses.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Runs</p>
          <p className="text-2xl font-bold text-slate-900">{totalRuns}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Successful</p>
          <p className="text-2xl font-bold text-emerald-600">{successCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Failed</p>
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {!logs || logs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <p className="text-slate-700 font-medium mb-1">No automation runs yet</p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              When you shortlist a candidate from the Results page, the n8n workflow will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-3 md:px-6 py-3 text-left hidden sm:table-cell">Timestamp</th>
                  <th className="px-3 md:px-6 py-3 text-left">Candidate</th>
                  <th className="px-3 md:px-6 py-3 text-left">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left">Outcome</th>
                  <th className="px-3 md:px-6 py-3 text-left hidden md:table-cell">Notification</th>
                  <th className="px-3 md:px-6 py-3 text-left hidden md:table-cell">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const candidate = log.candidates as { candidate_name: string } | null
                  const parsed = parseWorkflowResponse(log.response)
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 md:px-6 py-4 text-slate-500 whitespace-nowrap text-xs hidden sm:table-cell">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 md:px-6 py-4 text-slate-900 font-medium">{candidate?.candidate_name ?? '-'}</td>
                      <td className="px-3 md:px-6 py-4">
                        <StatusBadge status={log.status ?? 'pending'} />
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <OutcomeBadge value={parsed.match_path} />
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                        <NotificationBadge value={parsed.notification_sent} />
                      </td>
                      <td className="px-3 md:px-6 py-4 text-slate-500 text-xs max-w-xs truncate hidden md:table-cell">
                        {parsed.message}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function parseWorkflowResponse(response: unknown): {
  match_path: string
  message: string
  notification_sent: boolean | undefined
} {
  const fallback = {
    match_path: '',
    notification_sent: undefined,
    message: typeof response === 'string' ? response : JSON.stringify(response ?? ''),
  }

  try {
    const parsed =
      typeof response === 'string'
        ? JSON.parse(response)
        : response

    if (!parsed || typeof parsed !== 'object') return fallback

    const data = parsed as WorkflowResponse
    return {
      match_path: data.match_path ?? '',
      notification_sent: data.notification_sent,
      message: data.message ?? fallback.message,
    }
  } catch {
    return fallback
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const style = styles[status] ?? styles.pending
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}

function OutcomeBadge({ value }: { value: string }) {
  const label = value === 'high_match' ? 'High match' : value === 'low_match' ? 'Low match' : '-'
  const style =
    value === 'high_match'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : value === 'low_match'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-400 border-slate-200'

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  )
}

function NotificationBadge({ value }: { value: boolean | undefined }) {
  const label = value === true ? 'Sent' : value === false ? 'Skipped' : '-'
  const style =
    value === true
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : value === false
      ? 'bg-slate-100 text-slate-500 border-slate-200'
      : 'bg-slate-50 text-slate-400 border-slate-200'

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  )
}
