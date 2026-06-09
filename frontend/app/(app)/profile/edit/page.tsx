import type { Metadata } from 'next'
import { ProfileEditView } from '@/components/profile/ProfileEditView'

export const metadata: Metadata = { title: 'Edit Profile' }

export default function ProfileEditPage() {
  return <ProfileEditView />
}
