'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CredentialSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CredentialsSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CredentialSkeleton key={i} />
      ))}
    </div>
  );
}
