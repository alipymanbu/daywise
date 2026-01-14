'use client';

import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { add, sub } from 'date-fns';
import { generateScheduleAction, rescheduleTasksAction } from '@/app/actions';
import type { ScheduleItem, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './Icons';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { ScheduleView } from './ScheduleView';
import { CalendarEvents } from './CalendarEvents';
import { ProgressTracker } from './ProgressTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '../ui/label';
import { AnimatePresence, motion } from 'framer-motion';

const initialTasks: Task[] = [
  { id: '1', description: 'Draft Q3 marketing report', deadline: add(new Date(), { days: 1 }), priority: 'high', completed: false, estimatedTime: 120 },
  { id: '2', description: 'Prepare slides for team meeting', deadline: new Date(), priority: 'medium', completed: false, estimatedTime: 45 },
  { id: '3', description: 'Review code pull request from John', deadline: add(new Date(), { days: 2 }), priority: 'medium', completed: true, estimatedTime: 30 },
  { id: '4', description: 'Brainstorm ideas for new feature', deadline: add(new Date(), { days: 3 }), priority: 'low', completed: false, estimatedTime: 60 },
];

export default function DayWiseClient() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);
  const [isSchedulePending, startScheduleTransition] = React.useTransition();
  const [isReschedulePending, startRescheduleTransition] = React.useTransition();
  const [rescheduleTask, setRescheduleTask] = React.useState<Task | null>(null);
  const [rescheduleReason, setRescheduleReason] = React.useState('');
  const { toast } = useToast();

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...taskData, id: uuidv4(), completed: false };
    setTasks((prev) => [...prev, newTask]);
    toast({ title: 'Task Added!', description: `"${newTask.description}" has been added to your list.` });
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed } : task))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast({ title: 'Task Removed', variant: 'destructive' });
  };
  
  const handleGenerateSchedule = () => {
    startScheduleTransition(async () => {
      const { schedule, error } = await generateScheduleAction(tasks);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (schedule) {
        setSchedule(schedule);
        toast({ title: 'Schedule Generated!', description: 'Your AI-optimized schedule is ready.' });
      }
    });
  };

  const handleReschedule = () => {
    if (!rescheduleTask || !rescheduleReason) return;
    
    startRescheduleTransition(async () => {
        const { tasks: updatedTasks, error } = await rescheduleTasksAction(tasks, rescheduleReason);
        if (error) {
            toast({ title: 'Error', description: error, variant: 'destructive' });
        } else if (updatedTasks) {
            setTasks(updatedTasks);
            toast({ title: 'Tasks Rescheduled', description: 'Your tasks have been re-optimized.' });
            // Optionally, regenerate the full day schedule
            startScheduleTransition(async () => {
                const { schedule: newSchedule } = await generateScheduleAction(updatedTasks);
                if (newSchedule) setSchedule(newSchedule);
            });
        }
        setRescheduleTask(null);
        setRescheduleReason('');
    });
  };

  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).sort((a,b) => Number(a.completed) - Number(b.completed));
  }, [tasks]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b bg-card">
          <div className="container mx-auto flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">DayWise</h1>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <Card>
                    <AccordionTrigger className="p-6">
                      <CardTitle>Add a New Task</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-6 pt-0">
                        <TaskForm onAddTask={handleAddTask} />
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              <Card>
                <CardHeader>
                  <CardTitle>Your Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedTasks.length > 0 ? (
                    sortedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onReschedule={setRescheduleTask}
                        />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No tasks yet. Add one to get started!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <ProgressTracker tasks={tasks} />
              <ScheduleView schedule={schedule} onGenerate={handleGenerateSchedule} isPending={isSchedulePending} />
              <CalendarEvents />
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={!!rescheduleTask} onOpenChange={(open) => !open && setRescheduleTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Running late on "{rescheduleTask?.description}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Let's re-optimize your day. Briefly explain the delay, and AI will suggest a new schedule for your remaining tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for delay</Label>
            <Textarea 
              id="reason"
              placeholder="e.g., Meeting ran over, ran into an issue."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReschedule} disabled={isReschedulePending || !rescheduleReason}>
              {isReschedulePending ? "Rescheduling..." : "Reschedule with AI"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
