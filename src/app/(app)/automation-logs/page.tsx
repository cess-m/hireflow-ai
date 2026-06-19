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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-950">Automation Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Track shortlist workflow attempts and n8n responses.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {!logs || logs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-500 text-sm">No automation runs yet.</p>
            <p className="text-slate-400 text-xs mt-1">
              Shortlist a candidate from the Results page to trigger a workflow.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                <th className="px-6 py-3 text-left font-medium">Candidate</th>
                <th className="px-6 py-3 text-left font-medium">Workflow</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Outcome</th>
                <th className="px-6 py-3 text-left font-medium">Notification</th>
                <th className="px-6 py-3 text-left font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const candidate = log.candidates as { candidate_name: string } | null
                const parsed = parseWorkflowResponse(log.response)
                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-950 font-medium">{candidate?.candidate_name ?? '-'}</td>
                    <td className="px-6 py-3 text-slate-600">{log.workflow_name ?? 'n8n Shortlist Review'}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={log.status ?? 'pending'} />
                    </td>
                    <td className="px-6 py-3">
                      <OutcomeBadge value={parsed.match_path} />
                    </td>
                    <td className="px-6 py-3">
                      <NotificationBadge value={parsed.notification_sent} />
                    </td>
                    <td className="px-6 py-3 text-slate-600 text-xs max-w-sm truncate">
                      {parsed.message}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
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
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : 'bg-slate-50 text-slate-400 border-slate-200'

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
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
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : 'bg-slate-50 text-slate-400 border-slate-200'

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  )
}
