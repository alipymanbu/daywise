'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  deadline: z.date({
    required_error: 'A deadline is required.',
  }),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedTime: z.coerce.number().min(1, 'Estimated time must be at least 1 minute.'),
});

type TaskFormProps = {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  onUpdateTask?: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  editingTask?: Task | null;
  onCancelEdit?: () => void;
  isSubmitting?: boolean;
};

export function TaskForm({ onAddTask, onUpdateTask, editingTask, onCancelEdit, isSubmitting = false }: TaskFormProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const isEditing = !!editingTask;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      priority: 'medium',
      estimatedTime: 30,
    },
  });

  // Update form when editing task changes
  React.useEffect(() => {
    if (editingTask) {
      form.reset({
        description: editingTask.description,
        deadline: editingTask.deadline,
        priority: editingTask.priority,
        estimatedTime: editingTask.estimatedTime,
      });
    } else {
      form.reset({
        description: '',
        priority: 'medium',
        estimatedTime: 30,
      });
    }
  }, [editingTask, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing && onUpdateTask) {
      await onUpdateTask(values);
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      await onAddTask(values);
    }
    form.reset();
    // Reset calendar state when form is reset
    setCalendarOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", isEditing && "border-2 border-blue-500 rounded-lg p-4")}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Finalize project report" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="single"
                      required
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          // Close popover immediately when date is selected
                          setCalendarOpen(false);
                        } else {
                          // Allow clearing the date
                          field.onChange(undefined);
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (min)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          {isEditing && onCancelEdit && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className={isEditing ? "flex-1 bg-blue-600 hover:bg-blue-700" : "w-full"}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {isEditing ? 'Updating...' : 'Adding Task...'}
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> {isEditing ? 'Update Task' : 'Add Task'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
