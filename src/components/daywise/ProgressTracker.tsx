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

  React.useEffect(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    setCompletedTasks(completed);
    setProgress(totalTasks > 0 ? (completed / totalTasks) * 100 : 0);
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <span>{completedTasks} / {tasks.length} tasks completed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} aria-label={`${Math.round(progress)}% of tasks complete`} />
      </CardContent>
    </Card>
  );
}
