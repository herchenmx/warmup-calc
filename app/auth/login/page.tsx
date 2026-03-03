import { AuthForm } from '@/components/AuthForm'
import { Dumbbell } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; error?: string }
}) {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="mb-8 text-center">
        <Dumbbell className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Welcome to Warmup Calc</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to save workouts and sync preferences
        </p>
      </div>

      {searchParams.error === 'oauth' && (
        <p className="mb-4 rounded-xl bg-red-950/60 border border-red-900 px-4 py-3 text-sm text-red-300 text-center">
          Sign-in failed. Please try again.
        </p>
      )}

      <AuthForm redirectTo={searchParams.redirectTo ?? '/'} />
    </div>
  )
}
