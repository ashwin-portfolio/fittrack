import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start tracking your fitness journey</p>
      </div>
      {/* RegisterForm goes here */}
    </div>
  )
}
