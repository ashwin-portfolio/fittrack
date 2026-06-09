import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { from } = await searchParams
  // Sanitise the redirect — only allow relative paths to prevent open redirect
  const redirect = from?.startsWith('/') ? from : '/dashboard'
  return <LoginForm defaultRedirect={redirect} />
}
