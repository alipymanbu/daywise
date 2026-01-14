'use client';

import { Clock, Zap } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';

type ScheduleViewProps = {
  schedule: ScheduleItem[];
  onGenerate: () => void;
  isPending: boolean;
};

function ScheduleItemCard({ item }: { item: ScheduleItem }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className="font-semibold text-sm">{item.startTime}</div>
        <div className="h-6 w-px bg-border my-1"></div>
        <div className="text-xs text-muted-foreground">{item.endTime}</div>
      </div>
      <div className="w-full bg-card p-3 rounded-md border -mt-1">
        <p className="font-medium text-sm text-card-foreground">
          {item.taskDescription}
        </p>
      </div>
    </div>
  );
}


export function ScheduleView({ schedule, onGenerate, isPending }: ScheduleViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Schedule</CardTitle>
        <Button size="sm" onClick={onGenerate} disabled={isPending}>
          <Zap className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                   <Skeleton className="h-5 w-12" />
                   <div className="h-6 w-px bg-border my-1"></div>
                   <Skeleton className="h-4 w-12" />
                </div>
                 <Skeleton className="h-14 w-full" />
              </div>
            ))
          ) : schedule.length > 0 ? (
            schedule.map((item, index) => (
              <ScheduleItemCard key={index} item={item} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="mx-auto h-8 w-8 mb-2" />
              <p>Your generated schedule will appear here.</p>
              <p className="text-xs">Add some tasks and click 'Generate'.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
