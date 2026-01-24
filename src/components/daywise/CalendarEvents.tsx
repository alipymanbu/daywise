'use client';

import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { ScheduleItem, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CalendarEventsProps = {
  schedule?: ScheduleItem[];
  tasks?: Task[];
};

export function CalendarEvents({ schedule = [], tasks = [] }: CalendarEventsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tasks due today
  const todayTasks = tasks.filter(task => {
    if (task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() === today.getTime();
  });

  // If schedule exists, use it; otherwise use today's tasks
  const events = schedule.length > 0 
    ? schedule.map((item, index) => ({
        id: `schedule-${index}`,
        title: item.taskDescription,
        time: `${item.startTime} - ${item.endTime}`,
        displayTime: item.startTime,
        isSchedule: true,
      }))
    : todayTasks.map((task) => {
        const deadline = new Date(task.deadline);
        return {
          id: `task-${task.id}`,
          title: task.description,
          time: format(deadline, 'h:mm a'),
          displayTime: format(deadline, 'h:mm a'),
          isSchedule: false,
        };
      });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-2 rounded-md bg-background border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {event.isSchedule && (
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 ml-2">
                  {event.displayTime}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No events scheduled for today.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
