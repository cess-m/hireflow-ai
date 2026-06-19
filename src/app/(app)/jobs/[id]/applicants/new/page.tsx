import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddApplicantForm from './AddApplicantForm'

export default async function AddApplicantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: job } = await supabase
    .from('screenings')
    .select('id, job_title, job_description')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!job) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard?tab=jobs" className="hover:text-slate-950 transition">Job Cards</Link>
        <span>/</span>
        <Link href={`/jobs/${job.id}`} className="hover:text-slate-950 transition">{job.job_title}</Link>
        <span>/</span>
        <span className="text-slate-950 font-medium">Add Applicant</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-950">Add Applicant</h1>
        <p className="text-sm text-slate-500 mt-1">Paste a resume and screen it against this saved job card.</p>
      </div>

      <AddApplicantForm job={job} />
    </div>
  )
}
