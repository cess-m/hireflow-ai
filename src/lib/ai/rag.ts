const SKILL_KEYWORDS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  // Frontend
  'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'sass',
  // Backend
  'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails',
  // Databases
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase', 'dynamodb', 'elasticsearch', 'sqlite',
  // Cloud & DevOps
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'github actions', 'jenkins', 'nginx', 'linux',
  // AI/ML
  'machine learning', 'deep learning', 'nlp', 'llm', 'langchain', 'pytorch', 'tensorflow', 'scikit-learn', 'openai',
  // APIs & Arch
  'rest api', 'graphql', 'websockets', 'microservices', 'grpc', 'kafka', 'rabbitmq',
  // Tools
  'git', 'agile', 'scrum', 'jira', 'figma', 'sql', 'nosql', 'n8n', 'zapier',
  // Growth and marketing
  'digital marketing', 'seo', 'sem', 'google analytics', 'google analytics 4', 'ga4', 'google ads',
  'meta business suite', 'facebook ads', 'paid search', 'display advertising', 'email marketing',
  'hubspot', 'mailchimp', 'semrush', 'ahrefs', 'a/b testing', 'ab testing', 'conversion rate',
  'campaign management', 'content strategy', 'market research', 'crm',
  // Soft skills
  'leadership', 'written communication', 'verbal communication', 'teamwork', 'problem solving', 'project management',
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function hasSkill(text: string, skill: string): boolean {
  const normalizedText = text.toLowerCase()
  const normalizedSkill = skill.toLowerCase()

  if (normalizedSkill === 'c++') return /(^|[^a-z0-9])c\+\+([^a-z0-9]|$)/i.test(text)
  if (normalizedSkill === 'c#') return /(^|[^a-z0-9])c#([^a-z0-9]|$)/i.test(text)

  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(normalizedSkill)}([^a-z0-9+#]|$)`, 'i')
  return pattern.test(normalizedText)
}

export function extractJDSkills(jobDescription: string): string[] {
  return SKILL_KEYWORDS.filter((skill) => hasSkill(jobDescription, skill))
}

export function getEvidenceChunks(resumeText: string, jdSkills: string[], topN = 3): string[] {
  if (jdSkills.length === 0) return []

  const chunks = resumeText
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((c) => c.trim())
    .filter((c) => c.length > 40)
    .filter((c) => !/^[A-Z\s.]+\s*\|/.test(c))
    .filter((c) => !/(linkedin\.com|github\.com|\+63|@)/i.test(c))

  if (chunks.length === 0) return []

  const scored = chunks
    .map((chunk) => {
      const hits = jdSkills.filter((s) => hasSkill(chunk, s)).length
      return { chunk: chunk.replace(/\s+/g, ' '), hits }
    })
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, topN)

  return scored.map((s) => {
    const snippet = s.chunk.slice(0, 260).trim()
    return s.chunk.length > 260 ? `${snippet.replace(/[,\s]+$/, '')}...` : snippet
  })
}
