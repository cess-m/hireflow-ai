import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.session?.provider_token) {
      await supabase.from('google_oauth_tokens').upsert(
        {
          user_id: data.session.user.id,
          access_token: data.session.provider_token,
          refresh_token: data.session.provider_refresh_token ?? null,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          google_email: data.session.user.email ?? null,
        },
        { onConflict: 'user_id' }
      )
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
