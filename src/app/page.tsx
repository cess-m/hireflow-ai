import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white">
        <span className="text-lg font-semibold">HireFlow AI</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-950 transition"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="px-8 py-20 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            Recruiting workflow automation
          </div>
          <h1 className="text-5xl font-semibold leading-tight mb-5">
            Screen candidates with structured, evidence-grounded AI support.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-8">
            HireFlow AI helps recruiters compare resumes against job requirements, review clear evidence, and prepare shortlist workflows with human oversight.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition text-center"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </main>

      <section id="features" className="px-8 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Structured screening',
              desc: 'Scores are computed by backend logic, while the AI writes summaries, explanations, and interview questions.',
            },
            {
              title: 'Evidence snippets',
              desc: 'Keyword-based retrieval surfaces resume excerpts that support the match result.',
            },
            {
              title: 'Shortlist automation',
              desc: 'When n8n is configured, reviewed candidates can be sent to Google Sheets from the results page.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
            >
              <h3 className="font-semibold text-slate-950 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
