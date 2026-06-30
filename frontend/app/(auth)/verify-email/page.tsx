import type { Metadata } from 'next'
import { VerifyEmailContent } from '@/components/auth/VerifyEmailContent'

export const metadata: Metadata = { title: 'Verify email' }

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams
  return <VerifyEmailContent token={token ?? ''} />
}
