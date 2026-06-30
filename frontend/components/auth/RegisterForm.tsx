'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useAuthContext } from '@/lib/auth/context'
import { getApiErrorMessage } from '@/lib/api/client'
import { registerSchema, type RegisterFormValues } from '@/lib/utils/validators'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const { register } = useAuthContext()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: '',
      username: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await register({
        display_name: values.display_name,
        username: values.username,
        email: values.email,
        password: values.password,
      })
      setRegisteredEmail(values.email)
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) })
    }
  }

  const isSubmitting = form.formState.isSubmitting

  if (registeredEmail) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Account created!</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{registeredEmail}</strong>. Click it to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center border-t pt-4">
          <Link href="/dashboard" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Continue to dashboard
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>Start tracking your fitness journey today</CardDescription>
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
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Doe"
                      autoComplete="name"
                      autoFocus
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jane_doe"
                      autoComplete="username"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    3–20 characters · letters, numbers, hyphens, underscores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <input
                        type="text"
                        placeholder="Min. 8 characters"
                        autoComplete="off"
                        disabled={isSubmitting}
                        style={!showPassword ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        className="flex-1 min-w-0 bg-transparent pl-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={isSubmitting}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="flex-shrink-0 flex items-center pl-2 pr-3 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        autoComplete="off"
                        disabled={isSubmitting}
                        style={!showConfirm ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        className="flex-1 min-w-0 bg-transparent pl-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={isSubmitting}
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <span className="underline underline-offset-4">Terms of Service</span>
            </p>

          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
