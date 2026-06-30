'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { authApi } from '@/lib/api/auth'
import { getApiErrorMessage } from '@/lib/api/client'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type FormValues = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await authApi.forgotPassword({ email: values.email })
      setSent(true)
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) })
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
          <CardDescription>
            If your email is registered, you&apos;ll receive a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center border-t pt-4">
          <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {form.formState.errors.root && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
