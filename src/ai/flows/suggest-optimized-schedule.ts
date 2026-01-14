'use server';

/**
 * @fileOverview Generates an optimized schedule for the user's day based on tasks, deadlines, and priorities.
 *
 * - suggestOptimizedSchedule - A function that generates an optimized schedule.
 * - SuggestOptimizedScheduleInput - The input type for the suggestOptimizedSchedule function.
 * - SuggestOptimizedScheduleOutput - The return type for the suggestOptimizedSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimizedScheduleInputSchema = z.object({
  tasks: z.array(
    z.object({
      description: z.string().describe('The description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD HH:MM).'),
      priority: z.enum(['high', 'medium', 'low']).describe('The priority level of the task.'),
      estimatedTime: z
        .number()
        .describe('The estimated time in minutes required to complete the task.'),
    })
  ).describe('The list of tasks to schedule.'),
  currentTime: z.string().describe('The current time (e.g., YYYY-MM-DD HH:MM).'),
});

export type SuggestOptimizedScheduleInput = z.infer<typeof SuggestOptimizedScheduleInputSchema>;

const SuggestOptimizedScheduleOutputSchema = z.object({
  schedule: z.array(
    z.object({
      taskDescription: z.string().describe('The description of the scheduled task.'),
      startTime: z.string().describe('The suggested start time for the task (e.g., YYYY-MM-DD HH:MM).'),
      endTime: z.string().describe('The suggested end time for the task (e.g., YYYY-MM-DD HH:MM).'),
    })
  ).describe('The optimized schedule for the day.'),
});

export type SuggestOptimizedScheduleOutput = z.infer<typeof SuggestOptimizedScheduleOutputSchema>;

export async function suggestOptimizedSchedule(
  input: SuggestOptimizedScheduleInput
): Promise<SuggestOptimizedScheduleOutput> {
  return suggestOptimizedScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimizedSchedulePrompt',
  input: {schema: SuggestOptimizedScheduleInputSchema},
  output: {schema: SuggestOptimizedScheduleOutputSchema},
  prompt: `You are an AI scheduling assistant. Given the current time and a list of tasks with descriptions, deadlines, priorities, and estimated times, generate an optimized schedule for the day.

Current Time: {{{currentTime}}}

Tasks:
{{#each tasks}}
- Description: {{{description}}}, Deadline: {{{deadline}}}, Priority: {{{priority}}}, Estimated Time: {{{estimatedTime}}} minutes
{{/each}}

Consider the priority and deadlines when creating the schedule. Higher priority tasks and tasks with earlier deadlines should be scheduled first. Ensure that the total estimated time for all tasks does not exceed the available time in the day. The schedule should be realistic and account for breaks and transitions between tasks.

Output the schedule as a JSON array of objects, where each object has the task description, suggested start time, and suggested end time.

Schedule:
`,
});

const suggestOptimizedScheduleFlow = ai.defineFlow(
  {
    name: 'suggestOptimizedScheduleFlow',
    inputSchema: SuggestOptimizedScheduleInputSchema,
    outputSchema: SuggestOptimizedScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
