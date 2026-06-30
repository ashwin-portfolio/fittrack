'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api/auth'
import { getApiErrorMessage } from '@/lib/api/client'

type State = 'loading' | 'success' | 'error'

interface VerifyEmailContentProps {
  token: string
}

export function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const [state, setState] = useState<State>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setErrorMessage('No verification token found in the link.')
      setState('error')
      return
    }
    authApi.verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setErrorMessage(getApiErrorMessage(err))
        setState('error')
      })
  }, [token])

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        {state === 'loading' && (
          <>
            <div className="flex justify-center mb-2">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying…</CardTitle>
            <CardDescription>Please wait while we verify your email address.</CardDescription>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
            <CardDescription>Your email address has been confirmed. You&apos;re all set.</CardDescription>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="flex justify-center mb-2">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification failed</CardTitle>
            <CardDescription>{errorMessage || 'This link is invalid or has expired.'}</CardDescription>
          </>
        )}
      </CardHeader>

      <CardFooter className="justify-center border-t pt-4 gap-4 text-sm">
        {state === 'success' && (
          <Link href="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
            Go to dashboard
          </Link>
        )}
        {state === 'error' && (
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
