'use client';

import { Calendar } from 'lucide-react';
import { calendarEvents } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CalendarEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {calendarEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-2 rounded-md bg-background"
            >
              <div className="flex items-center space-x-3">
                 <Calendar className="h-5 w-5 text-muted-foreground" />
                 <p className="text-sm font-medium">{event.title}</p>
              </div>
              <Badge variant="secondary">{event.startTime} - {event.endTime}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
