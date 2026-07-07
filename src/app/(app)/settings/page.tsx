import { createClient } from '@/lib/supabase-server'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sheetUrl = (user?.user_metadata?.google_sheet_url as string) ?? ''

  const { data: tokenRow } = await supabase
    .from('google_oauth_tokens')
    .select('google_email')
    .eq('user_id', user?.id ?? '')
    .single()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-950 mb-1">Settings</h1>
      <p className="text-sm text-slate-500 mb-8">
        Connect your Google account and paste your sheet URL to enable automatic candidate logging.
      </p>
      <SettingsForm sheetUrl={sheetUrl} connectedEmail={tokenRow?.google_email ?? null} />
    </div>
  )
}
