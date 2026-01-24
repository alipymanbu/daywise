'use client';

import * as React from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ProgressTrackerProps = {
  tasks: Task[];
};

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const [progress, setProgress] = React.useState(0);
  const [completedTasks, setCompletedTasks] = React.useState(0);
  const [totalTasks, setTotalTasks] = React.useState(0);

  React.useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter tasks due today
    const todayTasks = tasks.filter((task) => {
      const deadlineDate = new Date(task.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate.getTime() === today.getTime();
    });
    
    const completed = todayTasks.filter((task) => task.completed).length;
    const total = todayTasks.length;
    
    setCompletedTasks(completed);
    setTotalTasks(total);
    setProgress(total > 0 ? (completed / total) * 100 : 0);
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <span>{completedTasks} / {totalTasks} tasks completed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} aria-label={`${Math.round(progress)}% of today's tasks complete`} />
      </CardContent>
    </Card>
  );
}
