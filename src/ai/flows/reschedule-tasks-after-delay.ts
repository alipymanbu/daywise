'use server';

/**
 * @fileOverview This file defines a function to reschedule tasks after a delay using Firebase AI Logic SDK.
 *
 * It includes:
 * - `rescheduleTasksAfterDelay`: An exported function to initiate the rescheduling.
 * - `RescheduleTasksInput`: The input type for the `rescheduleTasksAfterDelay` function.
 * - `RescheduleTasksOutput`: The output type for the `rescheduleTasksAfterDelay` function.
 */

import { generateStructuredContent } from '@/lib/firebase-ai';

export type Task = {
  id: string;
  description: string;
  deadline: string; // ISO datetime format
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
};

export type RescheduleTasksInput = {
  tasks: Task[];
  delayReason: string;
  currentDateTime: string; // ISO datetime format
};

export type RescheduleTasksOutput = Task[];

export async function rescheduleTasksAfterDelay(
  input: RescheduleTasksInput
): Promise<RescheduleTasksOutput> {
  // Build the prompt for Gemini API
  const tasksList = input.tasks
    .map(
      (task) =>
        `- ID: ${task.id}\n  Description: ${task.description}\n  Deadline: ${task.deadline}\n  Priority: ${task.priority}\n  Completed: ${task.completed}`
    )
    .join('\n');

  const prompt = `You are an AI assistant powered by Firebase AI Logic SDK and Gemini API that helps users reschedule their tasks when they are delayed.

The user has been delayed and needs to reschedule their remaining tasks. Given the current tasks, the reason for the delay, and the current time, suggest new deadlines that take into account the priority of the tasks and their original deadlines.

Current Date and Time: ${input.currentDateTime}
Reason for Delay: ${input.delayReason}

Tasks:
${tasksList}

Instructions:
1. Only reschedule tasks that are NOT completed (completed: false)
2. Take into account the delay reason when adjusting deadlines
3. Higher priority tasks should be rescheduled to earlier times if possible
4. Maintain the original deadline if it's still feasible after the delay
5. Extend deadlines reasonably based on the delay reason
6. Do NOT change the id or completed status of any tasks
7. Return deadlines in ISO 8601 datetime format (e.g., "2024-01-24T14:30:00.000Z")

Return a JSON array of tasks with updated deadlines for incomplete tasks only. Include all tasks in the response, but only update deadlines for incomplete tasks.`;

  const schema = `[
  {
    "id": "string",
    "description": "string",
    "deadline": "string (ISO 8601 datetime format)",
    "priority": "high | medium | low",
    "completed": "boolean"
  }
]`;

  try {
    const result = await generateStructuredContent<RescheduleTasksOutput>(prompt, schema);
    return result;
  } catch (error) {
    console.error('Error rescheduling tasks with Firebase AI Logic SDK:', error);
    throw error;
  }
}
