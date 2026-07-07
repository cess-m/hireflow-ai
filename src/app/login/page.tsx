'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  )
}

const leftPanelFeatures = [
  'AI scores every resume against real job requirements',
  'Evidence snippets show exactly why each score was given',
  'Shortlist automation sends candidates to Google Sheets via n8n',
]

function LoginForm() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const switchMode = (nextMode: 'signin' | 'signup' | 'forgot') => {
    setMode(nextMode)
    setError('')
    setMessage('')
    setConfirmPassword('')
  }

  const handleGoogleSignIn = async () => {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'forgot') {
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      })
      if (error) {
        setError('Unable to send a reset link. Check the email format and try again.')
      } else {
        setMessage('If an account exists, a reset link has been sent.')
      }
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (data.session) {
        router.push('/dashboard')
      } else {
        setMessage('Check your email to confirm your account, then sign in.')
        setLoading(false)
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const heading =
    mode === 'signup' ? 'Create your account' :
    mode === 'forgot' ? 'Reset your password' :
    'Welcome back'

  const subheading =
    mode === 'signup' ? 'Start screening candidates with a free recruiter workspace.' :
    mode === 'forgot' ? 'Enter your email and we will send a secure reset link.' :
    'Sign in to HireFlow AI to continue.'

  return (
    <LoginShell>
      <div className="w-full max-w-sm">
        <div className="md:hidden mb-8">
          <Logo />
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to homepage
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">{heading}</h1>
        <p className="text-sm text-slate-500 mb-8">{subheading}</p>

        {mode !== 'forgot' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white rounded-lg py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150 cursor-pointer mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
            </button>

            <div className="relative mb-6">
              <div className="border-t border-slate-200" />
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-xs text-slate-400">or</span>
            </div>
          </>
        )}

        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`text-sm font-medium rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`text-sm font-medium rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="field-input"
              placeholder="you@example.com"
            />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="field-input"
                placeholder="Password"
              />
            </div>
          )}
          {mode === 'signup' && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="field-input"
                placeholder="Confirm password"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-emerald-700 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading
              ? mode === 'signup' ? 'Creating account...'
                : mode === 'forgot' ? 'Sending reset link...'
                : 'Signing in...'
              : mode === 'signup' ? 'Create account'
                : mode === 'forgot' ? 'Send reset link'
                : 'Sign in'}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer"
          >
            Forgot password?
          </button>
        )}

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </button>
        )}
      </div>
    </LoginShell>
  )
}

function LoginShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-[45%] bg-slate-900 flex-col justify-between p-12 shrink-0">
        <Logo dark size="lg" />
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug tracking-tight">
            Hire with evidence,<br />not instinct.
          </h2>
          <ul className="space-y-3 mt-6">
            {leftPanelFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-slate-600 text-xs">© 2025 HireFlow AI. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12 bg-white">
        {children ?? (
          <div className="w-full max-w-sm">
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        )}
      </div>
    </div>
  )
}
