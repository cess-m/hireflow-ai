import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { stripBiasSignals, sanitizeInput, detectInjection } from '@/lib/ai/preprocess'
import { extractJDSkills, getEvidenceChunks } from '@/lib/ai/rag'
import { computeScore, getRecommendation } from '@/lib/ai/score'
import { generateScreeningOutput } from '@/lib/ai/llm'
import { validateLLMOutput } from '@/lib/ai/validate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { screening_id, candidate_name, candidate_email, resume_text, job_title, job_description } = body

    if (!screening_id || !candidate_name || !resume_text || !job_title || !job_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (detectInjection(resume_text) || detectInjection(job_description)) {
      return NextResponse.json({ error: 'Input contains disallowed content' }, { status: 400 })
    }

    // Preprocess
    const cleanResume = stripBiasSignals(sanitizeInput(resume_text))
    const cleanJD = sanitizeInput(job_description)

    // RAG-lite
    const jdSkills = extractJDSkills(cleanJD)
    const evidenceSnippets = getEvidenceChunks(cleanResume, jdSkills)

    // Deterministic scoring
    const { score, matched, missing } = computeScore(cleanResume, jdSkills)
    const recommendation = getRecommendation(score)

    // LLM generation with fallback chain
    const rawOutput = await generateScreeningOutput({
      resumeText: cleanResume,
      jobDescription: cleanJD,
      jobTitle: job_title,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      evidenceSnippets,
    })

    // Validate before saving
    const validated = validateLLMOutput(rawOutput)

    // Persist
    const { data: candidate, error: insertErr } = await supabase
      .from('candidates')
      .insert({
        user_id: user.id,
        screening_id,
        candidate_name,
        candidate_email: candidate_email || null,
        resume_text,
        match_score: score,
        recommendation,
        matched_skills: matched,
        missing_skills: missing,
        evidence_snippets: evidenceSnippets,
        ai_summary: validated.summary,
        ai_explanation: validated.explanation,
        interview_questions: validated.interview_questions,
        email_draft: validated.email_draft,
        status: 'pending',
      })
      .select()
      .single()

    if (insertErr) throw new Error(insertErr.message)

    return NextResponse.json(candidate)
  } catch (err: unknown) {
    console.error('[/api/screen]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
