import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { extractSpreadsheetId, getValidAccessToken } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const { candidate_id } = await request.json()
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sheetUrl = (user.user_metadata?.google_sheet_url as string | undefined) ?? ''
    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheet not configured. Go to Settings to add your sheet URL.' },
        { status: 400 }
      )
    }

    const { data: tokenRow } = await supabase
      .from('google_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single()

    if (!tokenRow) {
      return NextResponse.json(
        { error: 'Google account not connected. Go to Settings and sign in with Google.' },
        { status: 400 }
      )
    }

    const googleAccessToken = await getValidAccessToken(tokenRow, supabase, user.id)
    const spreadsheetId = extractSpreadsheetId(sheetUrl)

    const { data: candidate, error: fetchErr } = await supabase
      .from('candidates')
      .select('*, screenings!screening_id(job_title)')
      .eq('id', candidate_id)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const screening = candidate.screenings as unknown as { job_title: string } | null
    const tabName = screening?.job_title ?? 'Shortlisted'

    const payload = {
      recruiter_email: user.email ?? '',
      candidate_name: candidate.candidate_name,
      candidate_email: candidate.candidate_email ?? '',
      job_title: tabName,
      match_score: candidate.match_score,
      recommendation: candidate.recommendation,
      matched_skills: (candidate.matched_skills ?? []).join(', '),
      missing_skills: (candidate.missing_skills ?? []).join(', '),
      ai_summary: candidate.ai_summary ?? '',
      email_draft: candidate.email_draft ?? '',
      candidate_status: candidate.status ?? 'pending',
      sheet_url: sheetUrl,
      tab_name: tabName,
      spreadsheet_id: spreadsheetId,
      google_access_token: googleAccessToken,
      timestamp: new Date().toISOString(),
    }

    const HEADERS = [
      'Candidate Name', 'Email', 'Score', 'Recommendation',
      'Matched Skills', 'Missing Skills', 'AI Summary', 'Timestamp',
    ]

    const row = [
      candidate.candidate_name,
      candidate.candidate_email ?? '',
      candidate.match_score != null ? `${candidate.match_score}%` : '',
      candidate.recommendation ?? '',
      (candidate.matched_skills ?? []).join(', '),
      (candidate.missing_skills ?? []).join(', '),
      candidate.ai_summary ?? '',
      new Date().toISOString(),
    ]

    const safeTabName = tabName.replace(/'/g, "''")
    const primaryRange = encodeURIComponent(`'${safeTabName}'!A1`)

    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${primaryRange}`,
      { headers: { 'Authorization': `Bearer ${googleAccessToken}` } }
    )
    const checkData = checkRes.ok ? await checkRes.json() : {}
    const sheetIsEmpty = !checkData.values || checkData.values.length === 0

    const rowsToWrite = sheetIsEmpty ? [HEADERS, row] : [row]

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${primaryRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    let sheetsRes = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rowsToWrite }),
    })

    // Tab doesn't exist yet — fall back to first sheet
    if (!sheetsRes.ok && sheetsRes.status === 400) {
      const fallbackRange = encodeURIComponent('A1')
      const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${fallbackRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
      sheetsRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rowsToWrite }),
      })
    }

    const sheetsBody = await sheetsRes.text()
    console.log('[automate] sheets status:', sheetsRes.status, 'body:', sheetsBody)
    const status = sheetsRes.ok ? 'success' : 'failed'

    await supabase.from('automation_logs').insert({
      user_id: user.id,
      candidate_id,
      workflow_name: 'Google Sheets Direct',
      payload,
      response: sheetsBody,
      status,
    })

    if (sheetsRes.ok) {
      await supabase
        .from('candidates')
        .update({ status: 'shortlisted' })
        .eq('id', candidate_id)

      const isHighMatch = (candidate.match_score ?? 0) >= 70
      if (isHighMatch) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          candidate_id,
          candidate_name: candidate.candidate_name,
          job_title: tabName,
          match_score: candidate.match_score,
          read: false,
        })
      }
    }

    if (!sheetsRes.ok) {
      return NextResponse.json({ error: `Google Sheets responded with ${sheetsRes.status}` }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[/api/automate]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
