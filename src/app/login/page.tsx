'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  )
}

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

  return (
    <LoginShell>
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-sm">
        <Link href="/" className="text-sm text-blue-700 hover:text-blue-800 font-medium">
          Back to landing page
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-950 mt-6">
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
                ? 'Reset your password'
                : 'Sign in to HireFlow AI'}
          </h1>
          <p className="text-slate-500 mt-1">
            {mode === 'signup'
              ? 'Start screening candidates with a recruiter workspace.'
              : mode === 'forgot'
                ? 'Enter your email and we will send a secure reset link.'
                : 'Recruiting workflow automation'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 border border-slate-200 rounded-md p-1 mb-5">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`text-sm font-medium rounded px-3 py-2 transition ${
              mode === 'signin' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`text-sm font-medium rounded px-3 py-2 transition ${
              mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label className="text-sm text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          )}
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-slate-700 block mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-emerald-700 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:opacity-50"
          >
            {loading
              ? mode === 'signup'
                ? 'Creating account...'
                : mode === 'forgot'
                  ? 'Sending reset link...'
                  : 'Signing in...'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'forgot'
                  ? 'Send reset link'
                  : 'Sign in'}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="mt-4 text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            Forgot password?
          </button>
        )}

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="mt-4 text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            Back to sign in
          </button>
        )}
      </div>
    </LoginShell>
  )
}

function LoginShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      {children ?? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-sm">
          <p className="text-slate-600">Loading...</p>
        </div>
      )}
    </div>
  )
}
