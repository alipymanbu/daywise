import type { CalendarEvent } from './types';
import { format } from 'date-fns';

const today = new Date();
const formatTime = (date: Date) => format(date, 'HH:mm');

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Stand-up',
    startTime: formatTime(new Date(today.setHours(9, 0, 0, 0))),
    endTime: formatTime(new Date(today.setHours(9, 15, 0, 0))),
  },
  {
    id: '2',
    title: 'Project Sync with Design Team',
    startTime: formatTime(new Date(today.setHours(11, 0, 0, 0))),
    endTime: formatTime(new Date(today.setHours(12, 0, 0, 0))),
  },
  {
    id: '3',
    title: 'Lunch Break',
    startTime: formatTime(new Date(today.setHours(12, 30, 0, 0))),
    endTime: formatTime(new Date(today.setHours(13, 30, 0, 0))),
  },
    {
    id: '4',
    title: '1:1 with Manager',
    startTime: formatTime(new Date(today.setHours(15, 0, 0, 0))),
    endTime: formatTime(new Date(today.setHours(15, 30, 0, 0))),
  },
];
