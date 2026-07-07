import Link from 'next/link'
import Logo from '@/components/Logo'

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Structured screening',
    desc: 'Scores are computed by backend logic — the AI writes summaries, explanations, and interview questions on top of the result, never the other way around.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: 'Evidence snippets',
    desc: 'Keyword retrieval surfaces the exact resume lines that support each score so reviewers can verify every result at a glance.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: 'Shortlist automation',
    desc: 'When n8n is connected, send approved candidates to Google Sheets directly from the results page without leaving HireFlow.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Define the role',
    desc: 'Paste or type your job requirements into HireFlow. No templates or formats required.',
  },
  {
    num: '02',
    title: 'Upload resumes',
    desc: 'Drop in PDF resumes one by one. HireFlow extracts and analyzes each one against your requirements.',
  },
  {
    num: '03',
    title: 'Review ranked results',
    desc: 'Open the results page to see AI scores, skill matches, evidence snippets, and ready to use interview questions.',
  },
]

const trustPoints = ['Zero manual scoring', 'Evidence on every decision', 'Human oversight built in']

const statItems = [
  {
    title: 'AI Scoring',
    sub: 'Every applicant ranked by skill match, not resume formatting.',
  },
  {
    title: 'Evidence Snippets',
    sub: 'The exact resume lines that drove each score, surfaced automatically.',
  },
  {
    title: 'Shortlist Automation',
    sub: 'Send reviewed candidates to Google Sheets via n8n in one click.',
  },
]

const mockSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs']

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="sticky top-4 z-20 mx-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-3.5 max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-full transition-colors duration-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-8 pt-16 pb-12 sm:pt-28 sm:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.07)_0%,transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: text content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
              AI Powered Recruiting
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Screen candidates<br />
              <span className="text-blue-600">with AI precision.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed">
              Stop sorting inboxes. HireFlow AI reads every resume, surfaces the evidence, and delivers ranked applicants so your team can focus on the conversations that hire.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-full transition-colors duration-200 text-center cursor-pointer"
              >
                Open Dashboard
              </Link>
              <Link
                href="/login?mode=signup"
                className="bg-white hover:bg-slate-100 text-slate-900 font-medium px-5 py-2.5 rounded-full border border-slate-200 transition-colors duration-200 text-center cursor-pointer"
              >
                Create free account
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              {trustPoints.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: decorative app preview */}
          <div className="hidden lg:flex flex-col gap-3 pointer-events-none select-none">
            {/* Notification badge floating above */}
            <div className="self-end bg-white border border-emerald-100 rounded-xl shadow-sm px-4 py-2.5 flex items-center gap-2.5 mr-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
              <p className="text-xs font-medium text-slate-700">Alex Rivera shortlisted to Google Sheets</p>
            </div>

            {/* Main candidate result card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
              {/* Card header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Screening Result</p>
                  <p className="font-semibold text-slate-900">Alex Rivera</p>
                  <p className="text-sm text-slate-500 mt-0.5">Senior Developer</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-blue-600 leading-none">85</p>
                  <p className="text-xs text-slate-400 mt-1">/ 100</p>
                </div>
              </div>

              {/* Matched skills */}
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Matched Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {mockSkills.map((s) => (
                    <span key={s} className="bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evidence snippet */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Evidence</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  "5+ years of React and TypeScript experience building scalable APIs with Node.js and PostgreSQL in production environments."
                </p>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Strong Match
                </span>
                <span className="text-xs text-blue-600 font-medium">View Results →</span>
              </div>
            </div>

            {/* Second candidate card (slightly behind / offset) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mx-4 opacity-70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 text-sm">Maria Santos</p>
                  <p className="text-xs text-slate-400 mt-0.5">Frontend Developer</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-500">62</p>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {statItems.map((s) => (
            <div key={s.title} className="px-6 py-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
              <p className="font-semibold text-slate-900 mb-1">{s.title}</p>
              <p className="stats-bar-text text-sm text-slate-500 leading-relaxed" translate="no">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
              Built for structured, transparent hiring
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Every decision is explainable. Every score is earned.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-blue-600">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-900 px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              From job post to shortlist in minutes
            </h2>
            <p className="text-slate-400 leading-relaxed">
              No setup required. Paste a job description, upload resumes, and get ranked results.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.num}>
                <p className="text-5xl font-bold text-blue-400 mb-4">{s.num}</p>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 md:px-8 py-14 sm:py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Start screening smarter today.
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Free to use. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?mode=signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-full transition-colors duration-200 cursor-pointer"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white font-medium px-5 py-2.5 rounded-full transition-colors duration-200 cursor-pointer"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" />
          <p className="text-sm text-slate-400">© 2025 HireFlow AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
