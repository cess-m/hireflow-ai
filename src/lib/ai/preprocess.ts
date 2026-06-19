const biasPatterns = [
  /\b(Mr\.|Mrs\.|Ms\.|Miss)\s+\w+/gi,
  /\b(age|born|dob|date of birth)\s*[:\-]\s*\d+/gi,
  /\bgender\s*[:\-]\s*\w+/gi,
  /\bsex\s*[:\-]\s*(male|female|m|f)\b/gi,
  /\b(married|single|divorced|widowed)\b/gi,
  /\bnationality\s*[:\-]\s*.+/gi,
]

const injectionPatterns = [
  /\bignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|context|messages?)\b/i,
  /\bforget\s+(everything|all|previous)\s+(instructions?|prompts?|context|messages?)\b/i,
  /\byou are now\b/i,
  /\bnew\s+(role|instructions?|persona)\b/i,
  /\boverride\s+(the\s+)?(system|developer|previous|prior)?\s*(prompt|instructions?|rules?)\b/i,
  /\b(disregard|bypass)\s+(the\s+)?(all\s+)?(previous|prior|above)?\s*(instructions?|prompts?|rules?)\b/i,
  /\breveal\s+(the\s+)?(system|developer)\s+(prompt|instructions?)\b/i,
]

export function stripBiasSignals(text: string): string {
  return biasPatterns.reduce((t, p) => t.replace(p, '[REDACTED]'), text)
}

export function detectInjection(text: string): boolean {
  return injectionPatterns.some((p) => p.test(text))
}

export function sanitizeInput(text: string): string {
  return text.slice(0, 8000).trim()
}
