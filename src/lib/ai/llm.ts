import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import type { LLMOutput } from './validate'

const SYSTEM_PROMPT = `You are an AI recruiting assistant. Evaluate candidates objectively based only on skills, experience, and qualifications - never make demographic assumptions. Return ONLY valid JSON, no other text.`

interface PromptParams {
  resumeText: string
  jobDescription: string
  jobTitle: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  evidenceSnippets: string[]
}

function buildPrompt(p: PromptParams): string {
  return `Evaluate this candidate for the role of "${p.jobTitle}".

Backend-computed match score: ${p.matchScore}%
Matched skills: ${p.matchedSkills.join(', ') || 'none detected'}
Missing skills: ${p.missingSkills.join(', ') || 'none'}
Top evidence from resume: ${p.evidenceSnippets.map((s, i) => `${i + 1}. "${s}"`).join(' | ') || 'none'}

<RESUME>
${p.resumeText.slice(0, 6000)}
</RESUME>

<JOB_DESCRIPTION>
${p.jobDescription.slice(0, 2000)}
</JOB_DESCRIPTION>

Return exactly this JSON structure:
{
  "summary": "2-3 sentence overall fit summary",
  "explanation": "2-3 sentence explanation of the match score",
  "interview_questions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "email_draft": "Professional recruiter email to the candidate (4-6 sentences)"
}`
}

function extractJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON object found in response')
  return JSON.parse(match[0])
}

async function callGroq(prompt: string): Promise<LLMOutput> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })
  return JSON.parse(res.choices[0].message.content!) as LLMOutput
}

async function callGemini(prompt: string): Promise<LLMOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${prompt}\n\nRespond only with valid JSON.`)
  return extractJSON(result.response.text()) as LLMOutput
}

async function callOpenRouter(prompt: string): Promise<LLMOutput> {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })
  const res = await client.chat.completions.create({
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  })
  return extractJSON(res.choices[0].message.content!) as LLMOutput
}

export async function generateScreeningOutput(params: PromptParams): Promise<LLMOutput> {
  const prompt = buildPrompt(params)

  try {
    return await callGroq(prompt)
  } catch (err) {
    console.error('[LLM] Groq failed, trying Gemini:', err)
  }

  try {
    return await callGemini(prompt)
  } catch (err) {
    console.error('[LLM] Gemini failed, trying OpenRouter:', err)
  }

  return await callOpenRouter(prompt)
}
