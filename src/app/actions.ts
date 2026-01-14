"use server";

import { rescheduleTasksAfterDelay } from "@/ai/flows/reschedule-tasks-after-delay";
import { suggestOptimizedSchedule } from "@/ai/flows/suggest-optimized-schedule";
import type { ScheduleItem, Task } from "@/lib/types";

export async function generateScheduleAction(
  tasks: Task[]
): Promise<{ schedule?: ScheduleItem[]; error?: string }> {
  try {
    if (tasks.filter(t => !t.completed).length === 0) {
      return { schedule: [] };
    }

    const aiInput = {
      tasks: tasks
        .filter((t) => !t.completed)
        .map((task) => ({
          description: task.description,
          deadline: task.deadline.toISOString(),
          priority: task.priority,
          estimatedTime: task.estimatedTime,
        })),
      currentTime: new Date().toISOString(),
    };

    const result = await suggestOptimizedSchedule(aiInput);
    return { schedule: result.schedule };
  } catch (e) {
    console.error(e);
    return { error: "Failed to generate schedule. Please try again." };
  }
}

export async function rescheduleTasksAction(
  tasks: Task[],
  delayReason: string
): Promise<{ tasks?: Task[]; error?: string }> {
  try {
    const aiInput = {
      tasks: tasks.map((task) => ({
        id: task.id,
        description: task.description,
        deadline: task.deadline.toISOString(),
        priority: task.priority,
        completed: task.completed,
      })),
      delayReason: delayReason,
      currentDateTime: new Date().toISOString(),
    };

    const rescheduledAiTasks = await rescheduleTasksAfterDelay(aiInput);

    const updatedTasks = tasks.map((originalTask) => {
      const rescheduledTask = rescheduledAiTasks.find(
        (t) => t.id === originalTask.id
      );
      if (rescheduledTask) {
        return {
          ...originalTask,
          deadline: new Date(rescheduledTask.deadline),
        };
      }
      return originalTask;
    });

    return { tasks: updatedTasks };
  } catch (e) {
    console.error(e);
    return { error: "Failed to reschedule tasks. Please try again." };
  }
}
