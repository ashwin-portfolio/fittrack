'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useAuthContext } from '@/lib/auth/context'
import { getApiErrorMessage } from '@/lib/api/client'
import { loginSchema, type LoginFormValues } from '@/lib/utils/validators'

interface LoginFormProps {
  defaultRedirect?: string
}

export function LoginForm({ defaultRedirect = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuthContext()
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values)
      router.replace(defaultRedirect)
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) })
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your FitTrack account</CardDescription>
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
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      autoComplete="username email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoFocus
                      disabled={form.formState.isSubmitting}
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      tabIndex={-1}
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <input
                        type="text"
                        autoComplete="off"
                        disabled={form.formState.isSubmitting}
                        style={!showPassword ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        className="flex-1 min-w-0 bg-transparent pl-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={form.formState.isSubmitting}
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

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>

          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
