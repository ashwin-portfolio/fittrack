'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { authApi } from '@/lib/api/auth'
import { getApiErrorMessage } from '@/lib/api/client'

const schema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormValues = z.infer<typeof schema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await authApi.resetPassword({
        token,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      })
      setDone(true)
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) })
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Invalid link</CardTitle>
          <CardDescription>This reset link is missing or malformed.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center border-t pt-4">
          <Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (done) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Password updated</CardTitle>
          <CardDescription>Your password has been changed. You can now sign in with your new password.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center border-t pt-4">
          <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
        <CardDescription>Choose a new password for your FitTrack account.</CardDescription>
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
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <input
                        type="text"
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        autoFocus
                        disabled={form.formState.isSubmitting}
                        style={!showNew ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        className="flex-1 min-w-0 bg-transparent pl-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={form.formState.isSubmitting}
                        onClick={() => setShowNew((v) => !v)}
                        aria-label={showNew ? 'Hide password' : 'Show password'}
                        className="flex-shrink-0 flex items-center pl-2 pr-3 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <input
                        type="text"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={form.formState.isSubmitting}
                        style={!showConfirm ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        className="flex-1 min-w-0 bg-transparent pl-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={form.formState.isSubmitting}
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        className="flex-shrink-0 flex items-center pl-2 pr-3 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
