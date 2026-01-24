"use server";

import { rescheduleTasksAfterDelay } from "@/ai/flows/reschedule-tasks-after-delay";
import { suggestOptimizedSchedule } from "@/ai/flows/suggest-optimized-schedule";
import type { ScheduleItem, Task } from "@/lib/types";
import { getTasks, createTask, updateTask, deleteTask, updateTasks } from "@/lib/firebase-tasks";

/**
 * Get all tasks from Firebase
 */
export async function getTasksAction(userId?: string): Promise<{ tasks?: Task[]; error?: string }> {
  try {
    const tasks = await getTasks(userId);
    return { tasks };
  } catch (e) {
    console.error(e);
    return { error: "Failed to fetch tasks. Please try again." };
  }
}

/**
 * Create a new task in Firebase
 */
export async function createTaskAction(
  taskData: Omit<Task, 'id' | 'completed'>,
  userId?: string
): Promise<{ task?: Task; error?: string }> {
  try {
    const task = await createTask(taskData, userId);
    return { task };
  } catch (e) {
    console.error('Create task error:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: `Failed to create task: ${errorMessage}` };
  }
}

/**
 * Update a task in Firebase
 */
export async function updateTaskAction(
  taskId: string,
  updates: Partial<Task>
): Promise<{ task?: Task; error?: string }> {
  try {
    const task = await updateTask(taskId, updates);
    return { task };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update task. Please try again." };
  }
}

/**
 * Delete a task from Firebase
 */
export async function deleteTaskAction(taskId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await deleteTask(taskId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete task. Please try again." };
  }
}

/**
 * Generate schedule from tasks in Firebase
 */
export async function generateScheduleAction(
  userId?: string
): Promise<{ schedule?: ScheduleItem[]; error?: string }> {
  try {
    // Fetch tasks from Firebase
    const tasks = await getTasks(userId);

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

    if (!result || !result.schedule) {
      return { error: "AI did not generate a valid schedule. Please try again." };
    }

    return { schedule: result.schedule };
  } catch (e) {
    console.error('AI Schedule Generation Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: `Failed to generate schedule: ${errorMessage}` };
  }
}

/**
 * Reschedule tasks after a delay - fetches from Firebase, updates, and saves back
 */
export async function rescheduleTasksAction(
  delayReason: string,
  userId?: string
): Promise<{ tasks?: Task[]; error?: string }> {
  try {
    // Fetch tasks from Firebase
    const tasks = await getTasks(userId);

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

    if (!rescheduledAiTasks || rescheduledAiTasks.length === 0) {
      return { error: "AI did not return rescheduled tasks. Please try again." };
    }

    // Only reschedule incomplete tasks
    const incompleteTasks = tasks.filter(t => !t.completed);
    const updatedTasks = tasks.map((originalTask) => {
      // Only update incomplete tasks
      if (originalTask.completed) {
        return originalTask;
      }

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

    // Save updated tasks back to Firebase
    const savedTasks = await updateTasks(updatedTasks);

    return { tasks: savedTasks };
  } catch (e) {
    console.error('AI Reschedule Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: `Failed to reschedule tasks: ${errorMessage}` };
  }
}
