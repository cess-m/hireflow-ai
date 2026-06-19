'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-sm">
        <Link href="/login" className="text-sm text-blue-700 hover:text-blue-800 font-medium">
          Back to sign in
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-950 mt-6">Set a new password</h1>
          <p className="text-slate-500 mt-1">Choose a new secure password for your HireFlow AI account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700 block mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="text-sm text-slate-700 block mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Confirm password"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-emerald-700 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:opacity-50"
          >
            {loading ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
