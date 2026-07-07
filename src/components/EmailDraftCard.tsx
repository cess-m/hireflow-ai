'use client'

import { useState } from 'react'

function formatEmailDraft(text: string): string {
  return text
    .replace(/^(Dear [^,\n]+,)\s+/i, '$1\n\n')
    .replace(/([.!])\s+(Best regards|Kind regards|Warm regards|Sincerely|Regards)[,.]?/gi, '$1\n\n$2,')
    .replace(/([.!])\s+(I look forward|Please feel free|Thank you for your time)/gi, '$1\n\n$2')
    .replace(/(Best regards|Kind regards|Warm regards|Sincerely|Regards),\s+(?!\n)/gi, '$1,\n')
}

export default function EmailDraftCard({
  emailDraft,
  candidateEmail,
  jobTitle,
}: {
  emailDraft: string
  candidateEmail?: string | null
  jobTitle?: string | null
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedDraft = formatEmailDraft(emailDraft)
  const subject = jobTitle ? `Interview Invitation – ${jobTitle}` : 'Interview Invitation'
  const gmailHref = candidateEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidateEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedDraft)}`
    : undefined

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Recruiter Email Draft</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                Copy
              </>
            )}
          </button>
          {gmailHref && (
            <a
              href={gmailHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              Open in mail
            </a>
          )}
        </div>
      </div>

      {/* Email body */}
      <div
        className="email-draft-body px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: '#334155' }}
        translate="no"
      >
        {formattedDraft}
      </div>
    </div>
  )
}
