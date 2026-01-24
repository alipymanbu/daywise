'use server';

/**
 * @fileOverview Generates an optimized schedule for the user's day based on tasks, deadlines, and priorities.
 * Uses Firebase AI Logic SDK with Gemini API
 *
 * - suggestOptimizedSchedule - A function that generates an optimized schedule.
 * - SuggestOptimizedScheduleInput - The input type for the suggestOptimizedSchedule function.
 * - SuggestOptimizedScheduleOutput - The return type for the suggestOptimizedSchedule function.
 */

import { generateStructuredContent } from '@/lib/firebase-ai';

export type SuggestOptimizedScheduleInput = {
  tasks: Array<{
    description: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
  }>;
  currentTime: string;
};

export type SuggestOptimizedScheduleOutput = {
  schedule: Array<{
    taskDescription: string;
    startTime: string;
    endTime: string;
  }>;
};

export async function suggestOptimizedSchedule(
  input: SuggestOptimizedScheduleInput
): Promise<SuggestOptimizedScheduleOutput> {
  // Build the prompt for Gemini API
  const tasksList = input.tasks
    .map(
      (task) =>
        `- Description: ${task.description}, Deadline: ${task.deadline}, Priority: ${task.priority}, Estimated Time: ${task.estimatedTime} minutes`
    )
    .join('\n');

  const prompt = `You are an AI scheduling assistant powered by Firebase AI Logic SDK and Gemini API. Given the current time and a list of tasks with descriptions, deadlines, priorities, and estimated times, generate an optimized schedule for the day.

Current Time: ${input.currentTime}

Tasks:
${tasksList}

Instructions:
1. Consider the priority and deadlines when creating the schedule
2. Higher priority tasks and tasks with earlier deadlines should be scheduled first
3. Ensure that the total estimated time for all tasks does not exceed the available time in the day (assume a standard 8-hour workday starting from current time)
4. The schedule should be realistic and account for breaks (15-minute breaks between tasks) and transitions
5. Format times as "HH:MM" (24-hour format) for startTime and endTime
6. Schedule tasks in chronological order

Return a JSON object with a "schedule" array. Each item in the schedule array should have:
- taskDescription: The description of the task
- startTime: The suggested start time (format: "HH:MM")
- endTime: The suggested end time (format: "HH:MM")`;

  const schema = `{
  "schedule": [
    {
      "taskDescription": "string",
      "startTime": "string (HH:MM format)",
      "endTime": "string (HH:MM format)"
    }
  ]
}`;

  try {
    const result = await generateStructuredContent<SuggestOptimizedScheduleOutput>(
      prompt,
      schema
    );
    return result;
  } catch (error) {
    console.error('Error generating schedule with Firebase AI Logic SDK:', error);
    throw error;
  }
}
