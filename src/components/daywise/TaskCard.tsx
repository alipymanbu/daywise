'use client';

import { format } from 'date-fns';
import { Calendar, Flag, MoreVertical, Trash2, Zap, AlertTriangle } from 'lucide-react';
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
  onDelete: (id:string) => void;
  onReschedule: (task: Task) => void;
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

export function TaskCard({ task, onToggle, onDelete, onReschedule }: TaskCardProps) {
    const isOverdue = !task.completed && task.deadline < new Date();
  return (
    <Card className={cn("transition-all", task.completed && "bg-muted/50")}>
      <CardContent className="p-4 flex items-start space-x-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(task.id, !!checked)}
          className="mt-1"
          aria-label={`Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
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
               <span className={cn(isOverdue && "text-destructive font-semibold")}>{format(task.deadline, 'MMM dd')}</span>
            </div>
            <div className="flex items-center">
              <Flag className={cn("mr-1.5 h-4 w-4", priorityMap[task.priority].iconColor)} />
              <span>{priorityMap[task.priority].label}</span>
            </div>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => onReschedule(task)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Running Late</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
