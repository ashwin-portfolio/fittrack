import type { Metadata } from 'next'
import { PublicProfileView } from '@/components/profile/PublicProfileView'

export const metadata: Metadata = { title: 'Profile' }

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  return <PublicProfileView username={username} />
}
