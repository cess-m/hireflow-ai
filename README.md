# HireFlow AI
## An AI-powered candidate screening platform that reduces bias while automating the recruiting workflow

**🔗 Live Demo:** [hireflow-ai-kappa.vercel.app](https://hireflow-ai-kappa.vercel.app/)
**🔗 Repository:** [github.com/cess-m/hireflow-ai](https://github.com/cess-m/hireflow-ai)

---

## About The Project

HireFlow AI is an AI-driven recruiting tool that screens resumes against a job description, generates a match score, interview questions, and a draft outreach email, and then automatically syncs shortlisted candidates into a recruiter's own Google Sheet. It was built to explore a specific problem: most AI screening tools speed up hiring, but they don't address the bias that AI models can pick up from resumes (names, schools, age indicators, etc.). HireFlow AI strips those signals out of a resume *before* it reaches the AI model, so scoring is based on skills and experience rather than identity markers.

Under the hood, a recruiter uploads a resume, the system parses the PDF server-side, removes bias-triggering signals, extracts the skills required from the job description, and matches the two using a combination of deterministic scoring and an LLM call. If a candidate is shortlisted, a webhook triggers an n8n automation that writes the candidate's details directly into the recruiter's connected Google Sheet, with full logging of every automation run.

### How it compares

| | Manual resume review | Typical AI screening tools | HireFlow AI |
|---|---|---|---|
| Speed | Slow | Fast | Fast |
| Bias handling | Depends on the reviewer | Rarely addressed | Bias signals stripped before AI scoring |
| Provider reliability | N/A | Usually single-provider | Falls back across 3 AI providers automatically |
| Workflow automation | None | Limited | Shortlist → Google Sheets sync via n8n, fully logged |

---

## Features

- Email/password and Google OAuth authentication
- Job posting creation and management
- PDF resume upload with server-side text extraction
- Bias-signal stripping (gender, age, ethnicity markers) before AI evaluation
- AI-generated match score, explanation, interview questions, and draft outreach email
- Automatic fallback across three AI providers if one is unavailable
- One-click shortlist that triggers a live n8n automation into Google Sheets
- Google OAuth token refresh handled automatically, no manual reconnection
- Full automation activity log (success/failure history)
- Prompt-injection detection on resume and job description inputs

---

## Built With

- [Next.js 16](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) — PostgreSQL database + authentication
- [Groq](https://groq.com/) (Llama 3.3 70B) — primary AI provider
- [Google Gemini](https://ai.google.dev/) (1.5 Flash) — fallback AI provider
- [OpenRouter](https://openrouter.ai/) — second fallback AI provider
- [n8n](https://n8n.io/) — workflow automation
- [Google Sheets API](https://developers.google.com/sheets/api) (OAuth 2.0)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — server-side PDF text extraction
- [Zod](https://zod.dev/) — schema validation
- [Tailwind CSS](https://tailwindcss.com/)

---

## Prerequisites & Setup

### Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com/) project (free tier works)
- API keys for at least one AI provider (Groq recommended — free tier available)
- A self-hosted or cloud [n8n](https://n8n.io/) instance (only required for the automation feature)
- A Google Cloud project with OAuth credentials (only required for Google Sheets sync)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/cess-m/hireflow-ai.git
   cd hireflow-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with the following variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Providers
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Google OAuth (for Sheets sync)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # n8n Automation
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. Run the database migrations in your Supabase project (SQL files in `/supabase/migrations`, if present, or set up the `screenings`, `candidates`, `automation_logs`, and `google_oauth_tokens` tables manually with RLS enabled per user).

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Sign up or log in** with email or Google.
2. **Create a job** by entering a title and description.
3. **Upload a candidate's resume** (PDF) from the job's applicant page.
4. HireFlow AI automatically:
   - Extracts the candidate's name and email
   - Strips bias-triggering signals from the resume text
   - Scores the candidate against the job description
   - Generates a summary, interview questions, and a draft outreach email
5. **Review the results** on the candidate's screening page.
6. **Shortlist a strong match** — this triggers an n8n automation that appends the candidate's details to your connected Google Sheet.
7. **Check the automation log** to see the history of every shortlist sync, including any failures.

> Try it live: [hireflow-ai-kappa.vercel.app](https://hireflow-ai-kappa.vercel.app/)

---

## Roadmap

- [ ] Add search and filter for candidates
- [ ] Support bulk resume upload / batch screening
- [ ] Add support for scanned/image-based PDFs (OCR)

See the [open issues](https://github.com/cess-m/hireflow-ai/issues) for a full list of proposed features and known issues.

---

## Contributing

This is currently a personal portfolio project, so it isn't set up for external contributions yet. That said, if you spot a bug or have a suggestion:

1. Open an issue describing the bug or idea
2. If you'd like to submit a fix, fork the repo, create a feature branch (`git checkout -b fix/your-fix-name`), commit your changes, and open a pull request

---

## Contact

**Princess Mae B. Parages**
- GitHub: [github.com/cess-m](https://github.com/cess-m)
- LinkedIn: [linkedin.com/in/princess-parages](https://linkedin.com/in/princess-parages)
- Email: pbparages@up.edu.ph

Project Link: [github.com/cess-m/hireflow-ai](https://github.com/cess-m/hireflow-ai)
