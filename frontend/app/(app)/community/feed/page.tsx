'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FeedList } from '@/components/community/FeedList'
import { FeedFilter } from '@/components/community/FeedFilter'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGlobalFeed, useFollowingFeed } from '@/hooks/useFeed'
import type { ActivityType } from '@/types/feed'

export default function CommunityFeedPage() {
  const [filter, setFilter] = useState<ActivityType | undefined>(undefined)

  const globalQuery = useGlobalFeed({ type: filter })
  const followingQuery = useFollowingFeed({ type: filter })

  return (
    <div className="space-y-4">
      <PageHeader title="Community" subtitle="See what others are up to" />

      <Tabs defaultValue="global">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <FeedFilter value={filter} onChange={setFilter} />
        </div>

        <TabsContent value="global" className="mt-4">
          <FeedList
            query={globalQuery}
            emptyTitle="No public activity yet"
            emptyDescription="Be the first to share a workout, meal, or weight log."
          />
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <FeedList
            query={followingQuery}
            emptyTitle="Nothing from people you follow"
            emptyDescription="Follow other users on the Discover page to see their activity here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
