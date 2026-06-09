import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username}` }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* Public profile for @{username} coming next */}
      <div data-username={username} />
    </div>
  )
}
