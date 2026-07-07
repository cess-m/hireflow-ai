'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('This reset link is expired or invalid. Request a new password reset link.')
      setLoading(false)
      return
    }

    setMessage('Password updated. Redirecting to sign in...')
    await supabase.auth.signOut()
    setTimeout(() => router.push('/login'), 1200)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-[45%] bg-slate-900 flex-col justify-between p-12 shrink-0">
        <Logo dark size="lg" />
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug tracking-tight">
            Secure your account.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Choose a strong password to keep your HireFlow AI workspace protected.
          </p>
        </div>
        <p className="text-slate-600 text-xs">© 2025 HireFlow AI. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <Logo />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Set a new password</h1>
          <p className="text-sm text-slate-500 mb-8">
            Choose a new secure password for your HireFlow AI account.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="New password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field-input"
                placeholder="Confirm password"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-emerald-700 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
