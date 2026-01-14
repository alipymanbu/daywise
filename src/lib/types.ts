export type Task = {
  id: string;
  description: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  estimatedTime: number; // in minutes
};

export type ScheduleItem = {
  taskDescription: string;
  startTime: string;
  endTime: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};
