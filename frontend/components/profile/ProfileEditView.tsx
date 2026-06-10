'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/shared/Avatar'
import { GoalSection } from '@/components/profile/GoalSection'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useAuthContext } from '@/lib/auth/context'
import { profileEditSchema, type ProfileEditValues } from '@/lib/validators/profile'
import type { Gender } from '@/types/profile'

export function ProfileEditView() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { data: profile, isLoading } = useMyProfile()
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      age: null,
      gender: null,
      height_cm: null,
      is_public: true,
    },
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      full_name: profile.full_name ?? '',
      bio: profile.bio ?? '',
      age: profile.age ?? null,
      gender: (profile.gender as ProfileEditValues['gender']) ?? null,
      height_cm: profile.height_cm ?? null,
      is_public: profile.is_public,
    })
  }, [profile, form])

  function onSubmit(values: ProfileEditValues) {
    updateProfile.mutate(
      {
        full_name: values.full_name,
        bio: values.bio || undefined,
        age: values.age ?? undefined,
        gender: (values.gender as Gender) ?? undefined,
        height_cm: values.height_cm ?? undefined,
        is_public: values.is_public,
      },
      { onSuccess: () => router.push('/profile') }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-lg">
        <Skeleton className="h-8 w-36" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const username = user?.username ?? ''
  const bioValue = form.watch('bio') ?? ''

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>

      {/* Avatar preview — initials-based, not uploadable */}
      <div className="flex items-center gap-4">
        <Avatar
          name={form.watch('full_name') || profile?.full_name || null}
          username={username}
          size="xl"
        />
        <div>
          <p className="text-sm font-medium">@{username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avatar is generated from your initials
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell others about yourself…"
                    rows={3}
                    maxLength={160}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription className="text-right tabular-nums">
                  {bioValue.length}/160
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age + Height */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={13}
                      max={120}
                      placeholder="—"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={50}
                      max={300}
                      step={0.1}
                      placeholder="—"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                  value={field.value ?? 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Privacy */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === 'public')}
                      value={field.value ? 'public' : 'private'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public — anyone can see your activity</SelectItem>
                        <SelectItem value="private">Private — only followers see your activity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Goal management — independent form, separate API call */}
      <GoalSection />
    </div>
  )
}
