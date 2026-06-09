import { redirect } from 'next/navigation'

export default async function LegacyUserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  redirect(`/users/${username}`)
}
