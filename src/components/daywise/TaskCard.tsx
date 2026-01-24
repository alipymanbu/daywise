'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Flag, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type TaskCardProps = {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};

const priorityMap = {
  high: {
    label: 'High',
    color: 'bg-red-500 border-red-500',
    iconColor: 'text-red-500',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500 border-yellow-500',
    iconColor: 'text-yellow-500',
  },
  low: {
    label: 'Low',
    color: 'bg-green-500 border-green-500',
    iconColor: 'text-green-500',
  },
};

export function TaskCard({ task, onToggle, onDelete, onEdit, isToggling = false, isDeleting = false }: TaskCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(task.deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const isToday = !task.completed && deadlineDate.getTime() === today.getTime();
  const isOverdue = !task.completed && deadlineDate < today;
  
  return (
    <Card className={cn("transition-all", task.completed && "bg-muted/50", (isToggling || isDeleting) && "opacity-50")}>
      <CardContent className="p-4 flex items-start space-x-4">
        <div className="relative mt-1">
          {isToggling && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={(checked) => onToggle(task.id, !!checked)}
            className={cn(isToggling && "opacity-0")}
            disabled={isToggling || isDeleting}
            aria-label={`Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        <div className="flex-grow space-y-2">
          <p
            className={cn(
              'font-medium leading-none',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
               <span className={cn(
                 isOverdue && "text-destructive font-semibold",
                 isToday && "text-primary font-semibold"
               )}>
                 {format(task.deadline, 'MMM dd')}
               </span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>
                {task.estimatedTime} min
              </span>
            </div>
            <div className="flex items-center">
              <Flag className={cn("mr-1.5 h-4 w-4", priorityMap[task.priority].iconColor)} />
              <span>{priorityMap[task.priority].label}</span>
            </div>
            {isToday && <Badge variant="default">Today</Badge>}
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isToggling || isDeleting}>
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!task.completed && (
              <DropdownMenuItem 
                onClick={() => onEdit(task)}
                disabled={isToggling || isDeleting}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}
            {!task.completed && (
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => onDelete(task.id)}
                disabled={isToggling || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
