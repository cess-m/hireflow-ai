import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { candidate_id } = await request.json()
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    const payload = {
      recruiter_email: user.email ?? '',
      candidate_name: candidate.candidate_name,
      candidate_email: candidate.candidate_email ?? '',
      job_title: screening?.job_title ?? '',
      match_score: candidate.match_score,
      recommendation: candidate.recommendation,
      matched_skills: (candidate.matched_skills ?? []).join(', '),
      missing_skills: (candidate.missing_skills ?? []).join(', '),
      ai_summary: candidate.ai_summary ?? '',
      email_draft: candidate.email_draft ?? '',
      candidate_status: candidate.status ?? 'pending',
      timestamp: new Date().toISOString(),
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json({ error: 'n8n webhook not configured' }, { status: 503 })
    }

    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const n8nBody = await n8nRes.text()
    const status = n8nRes.ok ? 'success' : 'failed'

    await supabase.from('automation_logs').insert({
      user_id: user.id,
      candidate_id,
      workflow_name: 'n8n Shortlist Review',
      payload,
      response: n8nBody,
      status,
    })

    if (n8nRes.ok) {
      await supabase
        .from('candidates')
        .update({ status: 'shortlisted' })
        .eq('id', candidate_id)
    }

    if (!n8nRes.ok) {
      return NextResponse.json({ error: `n8n responded with ${n8nRes.status}` }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[/api/automate]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
