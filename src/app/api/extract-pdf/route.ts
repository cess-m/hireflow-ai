import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export const runtime = 'nodejs'

const MAX_PDF_BYTES = 5 * 1024 * 1024
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

function extractCandidateEmail(text: string): string {
  return text.match(EMAIL_PATTERN)?.[0] ?? ''
}

function isLikelyNameLine(line: string): boolean {
  if (line.length < 4 || line.length > 80) return false
  if (EMAIL_PATTERN.test(line)) return false
  if (/[0-9]/.test(line)) return false
  if (/linkedin|github|portfolio|http|www\.|@|\+|phone|email|address|cebu|philippines/i.test(line)) return false
  if (/[|•:]/.test(line)) return false

  const words = line.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 6) return false

  return words.every((word) => /^[A-Za-z][A-Za-z.'-]*$/.test(word))
}

function extractCandidateName(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 12)

  return lines.find(isLikelyNameLine) ?? ''
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'PDF must be 5MB or smaller' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    try {
      const parsed = await parser.getText()
      const text = parsed.text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

      if (text.length < 100) {
        return NextResponse.json(
          { error: 'Could not extract enough text from this PDF. Paste the resume text manually.' },
          { status: 422 }
        )
      }

      return NextResponse.json({
        text,
        candidate_name: extractCandidateName(text),
        candidate_email: extractCandidateEmail(text),
        text_length: text.length,
      })
    } finally {
      await parser.destroy()
    }
  } catch (err: unknown) {
    console.error('[/api/extract-pdf]', err)
    const message = err instanceof Error ? err.message : 'Failed to extract PDF text'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
