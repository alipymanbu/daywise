'use client';

import * as React from 'react';
import { generateScheduleAction, getTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '@/app/actions';
import type { ScheduleItem, Task } from '@/lib/types';
import { toast } from 'react-toastify';
import { Logo } from './Icons';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { ScheduleView } from './ScheduleView';
import { CalendarEvents } from './CalendarEvents';
import { ProgressTracker } from './ProgressTracker';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertDialog } from '@base-ui/react/alert-dialog';
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
  const [userId, setUserId] = React.useState<string | null>(null);
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
  const notify = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const message = description ? `${title}: ${description}` : title;
    toast[type](message);
  };

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Detect browser/OS and create a stable user id
  React.useEffect(() => {
    if (!mounted) return;

    const getDeviceInfo = () => {
      const ua = navigator.userAgent || '';
      const platform = navigator.platform || '';
      const language = navigator.language || '';
      const vendor = navigator.vendor || '';

      return { ua, platform, language, vendor };
    };

    const hashString = (input: string) => {
      let hash = 0;
      for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    };

    const stored = localStorage.getItem('daywise-user-id');
    if (stored) {
      setUserId(stored);
      return;
    }

    const info = getDeviceInfo();
    const fingerprint = `${info.ua}|${info.platform}|${info.language}|${info.vendor}`;
    const id = `anon_${hashString(fingerprint)}`;
    localStorage.setItem('daywise-user-id', id);
    setUserId(id);
  }, [mounted]);

  // Fetch tasks from Firebase on mount
  React.useEffect(() => {
    if (!mounted || !userId) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      const { tasks: fetchedTasks, error } = await getTasksAction(userId);
      if (error) {
        notify('error', 'Error', error);
      } else if (fetchedTasks) {
        setTasks(fetchedTasks);
      }
      setIsLoading(false);
    };
    fetchTasks();
  }, [mounted, userId]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    setIsAddingTask(true);
    try {
      if (!userId) {
        notify('error', 'Error', 'User ID not ready. Please try again.');
        return;
      }
      const { task, error } = await createTaskAction(taskData, userId);
      if (error) {
        notify('error', 'Error', error);
      } else if (task) {
        setTasks((prev) => [...prev, task]);
        notify('success', 'Task Added!', `"${task.description}" has been added to your list.`);
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
        notify('error', 'Error', error);
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
        notify('error', 'Error', error);
      } else if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        notify('success', 'Task Removed', `"${taskToDelete.description}" has been deleted.`);
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
        if (!userId) {
          notify('error', 'Error', 'User ID not ready. Please try again.');
          return;
        }
        const { schedule, error } = await generateScheduleAction(userId);
        if (error) {
          notify('error', 'Error', error);
        } else if (schedule) {
          setSchedule(schedule);
          notify('success', 'Schedule Generated!', 'Your AI-optimized schedule is ready.');
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
        notify('error', 'Error', error);
      } else if (task) {
        setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? task : t)));
        notify('success', 'Task Updated!', `"${task.description}" has been updated.`);
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
          <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">DayWise</h1>
            </div>
            <ThemeToggle />
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
          <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">DayWise</h1>
            </div>
            {mounted ? <ThemeToggle /> : null}
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

      <AlertDialog.Root open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
          <AlertDialog.Popup className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold">Delete Task</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete "{taskToDelete?.description}"? This action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <AlertDialog.Close className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Cancel
              </AlertDialog.Close>
              <AlertDialog.Close
                className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                onClick={confirmDeleteTask}
                disabled={deletingTaskId === taskToDelete?.id}
              >
                {deletingTaskId === taskToDelete?.id ? "Deleting..." : "Delete"}
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
