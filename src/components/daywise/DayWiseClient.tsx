'use client';

import * as React from 'react';
import { generateScheduleAction, getTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '@/app/actions';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

export default function DayWiseClient() {
  const [mounted, setMounted] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [togglingTaskId, setTogglingTaskId] = React.useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null);
  const [isSchedulePending, startScheduleTransition] = React.useTransition();
  const [isGeneratingSchedule, setIsGeneratingSchedule] = React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'completed'>('all');
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch tasks from Firebase on mount
  React.useEffect(() => {
    if (!mounted) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      const { tasks: fetchedTasks, error } = await getTasksAction();
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (fetchedTasks) {
        setTasks(fetchedTasks);
      }
      setIsLoading(false);
    };
    fetchTasks();
  }, [mounted, toast]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    setIsAddingTask(true);
    try {
      const { task, error } = await createTaskAction(taskData);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (task) {
        setTasks((prev) => [...prev, task]);
        toast({ title: 'Task Added!', description: `"${task.description}" has been added to your list.` });
      }
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    setTogglingTaskId(id);
    try {
      const { task, error } = await updateTaskAction(id, { completed });
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? task : t))
        );
      }
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    const id = taskToDelete.id;
    setDeletingTaskId(id);
    try {
      const { success, error } = await deleteTaskAction(id);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        toast({ title: 'Task Removed', description: `"${taskToDelete.description}" has been deleted.`, variant: 'destructive' });
      }
    } finally {
      setDeletingTaskId(null);
      setTaskToDelete(null);
    }
  };

  const handleGenerateSchedule = () => {
    setIsGeneratingSchedule(true);
    startScheduleTransition(async () => {
      try {
        const { schedule, error } = await generateScheduleAction();
        if (error) {
          toast({ title: 'Error', description: error, variant: 'destructive' });
        } else if (schedule) {
          setSchedule(schedule);
          toast({ title: 'Schedule Generated!', description: 'Your AI-optimized schedule is ready.' });
        }
      } finally {
        setIsGeneratingSchedule(false);
      }
    });
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditing(true);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!taskToEdit) return;

    setIsAddingTask(true);
    try {
      const { task, error } = await updateTaskAction(taskToEdit.id, taskData);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (task) {
        setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? task : t)));
        toast({ title: 'Task Updated!', description: `"${task.description}" has been updated.` });
        setTaskToEdit(null);
        setIsEditing(false);
      }
    } finally {
      setIsAddingTask(false);
    }
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    let filtered = tasks;

    switch (dateFilter) {
      case 'today':
        filtered = tasks.filter((task) => {
          if (task.completed) return false;
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          return deadlineDate.getTime() === today.getTime();
        });
        break;
      case 'thisWeek':
        filtered = tasks.filter((task) => {
          if (task.completed) return false;
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          return deadlineDate >= startOfWeek;
        });
        break;
      case 'thisMonth':
        filtered = tasks.filter((task) => {
          if (task.completed) return false;
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          return deadlineDate >= startOfMonth;
        });
        break;
      case 'overdue':
        filtered = tasks.filter((task) => {
          if (task.completed) return false;
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          return deadlineDate < today;
        });
        break;
      case 'completed':
        filtered = tasks.filter((task) => task.completed);
        break;
      case 'all':
      default:
        // By default, hide completed tasks
        filtered = tasks.filter((task) => !task.completed);
        break;
    }

    return filtered
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [tasks, dateFilter]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b bg-card">
          <div className="container mx-auto flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">DayWise</h1>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

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
              <Accordion
                type="single"
                collapsible
                value={isEditing ? "item-1" : undefined}
                onValueChange={(value) => {
                  if (!value && isEditing) {
                    // Prevent closing when editing
                    return;
                  }
                }}
              >
                <AccordionItem value="item-1">
                  <Card>
                    <AccordionTrigger className="p-6">
                      <CardTitle>{isEditing ? 'Edit Task' : 'Add a New Task'}</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-6 pt-0">
                        <TaskForm
                          onAddTask={handleAddTask}
                          onUpdateTask={handleUpdateTask}
                          editingTask={isEditing ? taskToEdit : null}
                          onCancelEdit={() => {
                            setTaskToEdit(null);
                            setIsEditing(false);
                          }}
                          isSubmitting={isAddingTask}
                        />
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Tasks</CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={dateFilter} onValueChange={(value: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue') => setDateFilter(value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Active Tasks</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="thisWeek">This Week</SelectItem>
                          <SelectItem value="thisMonth">This Month</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading tasks...</p>
                  ) : filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={() => handleDeleteTask(task)}
                        onEdit={handleEditTask}
                        isToggling={togglingTaskId === task.id}
                        isDeleting={deletingTaskId === task.id}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {dateFilter === 'all'
                        ? 'No active tasks. Add one to get started!'
                        : dateFilter === 'completed'
                          ? 'No completed tasks yet.'
                          : `No tasks found for this filter.`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <ProgressTracker tasks={tasks} />
              <ScheduleView schedule={schedule} onGenerate={handleGenerateSchedule} isPending={isSchedulePending || isGeneratingSchedule} />
              <CalendarEvents schedule={schedule} tasks={tasks} />
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              disabled={deletingTaskId === taskToDelete?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTaskId === taskToDelete?.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
