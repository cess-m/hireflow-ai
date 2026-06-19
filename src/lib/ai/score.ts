import { hasSkill } from './rag'

export function computeScore(
  resumeText: string,
  jdSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (jdSkills.length === 0) return { score: 0, matched: [], missing: [] }

  const matched = jdSkills.filter((s) => hasSkill(resumeText, s))
  const missing = jdSkills.filter((s) => !hasSkill(resumeText, s))
  const score = Math.round((matched.length / jdSkills.length) * 100)

  return { score, matched, missing }
}

export function getRecommendation(score: number): string {
  if (score >= 80) return 'Strong Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Partial Match'
  if (score >= 20) return 'Weak Match'
  return 'No Match'
}
