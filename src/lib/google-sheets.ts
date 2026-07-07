import type { SupabaseClient } from '@supabase/supabase-js'

export function extractSpreadsheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) throw new Error('Invalid Google Sheets URL')
  return match[1]
}

type TokenRow = {
  access_token: string
  refresh_token: string | null
  expires_at: string | null
}

export async function getValidAccessToken(
  tokenRow: TokenRow,
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const isExpiredSoon = tokenRow.expires_at
    ? new Date(tokenRow.expires_at) < new Date(Date.now() + 60_000)
    : false

  if (!isExpiredSoon) return tokenRow.access_token
  if (!tokenRow.refresh_token) return tokenRow.access_token

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  const json = await res.json()
  if (!json.access_token) return tokenRow.access_token

  await supabase
    .from('google_oauth_tokens')
    .update({
      access_token: json.access_token,
      expires_at: new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString(),
    })
    .eq('user_id', userId)

  return json.access_token
}
