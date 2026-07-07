import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AutomationPanel from './AutomationPanel'
import ScoreRing from '@/components/ScoreRing'
import EmailDraftCard from '@/components/EmailDraftCard'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sheetUrl = (user?.user_metadata?.google_sheet_url as string | undefined) ?? null

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*, screenings!screening_id(id, job_title)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!candidate) notFound()

  const screening = candidate.screenings as unknown as { id: string; job_title: string } | null
  const matchedSkills: string[] = candidate.matched_skills ?? []
  const missingSkills: string[] = candidate.missing_skills ?? []
  const evidenceSnippets: string[] = candidate.evidence_snippets ?? []
  const interviewQuestions: string[] = candidate.interview_questions ?? []

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
        <span>/</span>
        {screening?.id ? (
          <>
            <Link href={`/jobs/${screening.id}`} className="hover:text-slate-950 transition">{screening.job_title}</Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-slate-950 font-medium truncate min-w-0">{candidate.candidate_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gradient-to-br from-blue-50 via-white to-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <ScoreRing score={candidate.match_score ?? 0} size={112} />
            </div>
            <div className="sm:border-l sm:border-blue-100 sm:pl-6 text-center sm:text-left" translate="no">
              <p className="text-xl font-bold text-slate-950 leading-tight">{candidate.candidate_name}</p>
              {candidate.candidate_email && (
                <p className="text-sm text-slate-500 mt-1">{candidate.candidate_email}</p>
              )}
              <p className="text-sm text-slate-500 mt-0.5">{screening?.job_title ?? 'No role'}</p>
              <div className="mt-3">
                <RecommendationBadge value={candidate.recommendation} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkillCard title="Matched Skills" skills={matchedSkills} tone="success" emptyText="None found" />
            <SkillCard title="Missing Skills" skills={missingSkills} tone="danger" emptyText="None identified" />
          </div>

          {evidenceSnippets.length > 0 && (
            <Section title="Evidence Snippets">
              <ol className="space-y-2">
                {evidenceSnippets.map((snippet, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="text-blue-600 font-medium shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{snippet}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {candidate.ai_summary && (
            <Section title="AI Summary">
              <p className="text-sm text-slate-700 leading-relaxed">{candidate.ai_summary}</p>
            </Section>
          )}

          {candidate.ai_explanation && (
            <Section title="Match Explanation">
              <p className="text-sm text-slate-700 leading-relaxed">{candidate.ai_explanation}</p>
            </Section>
          )}

          {interviewQuestions.length > 0 && (
            <Section title="Suggested Interview Questions">
              <ol className="space-y-2">
                {interviewQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="text-blue-600 font-medium shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {candidate.email_draft && (
            <EmailDraftCard
              emailDraft={candidate.email_draft}
              candidateEmail={candidate.candidate_email}
              jobTitle={screening?.job_title ?? null}
            />
          )}
        </div>

        <div className="space-y-4">
          <AutomationPanel
            candidateId={candidate.id}
            candidateStatus={candidate.status ?? 'pending'}
            sheetUrl={sheetUrl}
          />

          <div className="bg-white border border-slate-200 rounded-lg p-5 text-xs text-slate-500 leading-relaxed shadow-sm">
            <p className="font-semibold text-slate-700 mb-1">Human review required</p>
            This is a decision-support tool. All shortlist actions require human review before moving candidates forward.
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-950 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function SkillCard({
  title,
  skills,
  tone,
  emptyText,
}: {
  title: string
  skills: string[]
  tone: 'success' | 'danger'
  emptyText: string
}) {
  const badge =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-950 mb-3">{title}</h3>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className={`px-2 py-0.5 rounded-full text-xs border ${badge}`}
            >
              {s}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">{emptyText}</p>
      )}
    </div>
  )
}

function RecommendationBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    'Strong Match': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Good Match': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Partial Match': 'bg-amber-50 text-amber-700 border-amber-200',
    'Weak Match': 'bg-red-50 text-red-700 border-red-200',
    'No Match': 'bg-red-50 text-red-700 border-red-200',
  }
  if (!value) return null
  const style = styles[value] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {value}
    </span>
  )
}
