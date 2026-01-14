'use server';

/**
 * @fileOverview This file defines a Genkit flow to reschedule tasks after a delay.
 *
 * It includes:
 * - `rescheduleTasksAfterDelay`: An exported function to initiate the rescheduling flow.
 * - `RescheduleTasksInput`: The input type for the `rescheduleTasksAfterDelay` function.
 * - `RescheduleTasksOutput`: The output type for the `rescheduleTasksAfterDelay` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('Unique identifier for the task.'),
  description: z.string().describe('Description of the task.'),
  deadline: z.string().datetime().describe('The deadline for the task (ISO format).'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level of the task.'),
  completed: z.boolean().describe('Indicates if the task is completed.'),
});

export type Task = z.infer<typeof TaskSchema>;

const RescheduleTasksInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('The list of tasks to reschedule.'),
  delayReason: z.string().describe('The reason for the delay in completing the task.'),
  currentDateTime: z.string().datetime().describe('The current date and time (ISO format).'),
});

export type RescheduleTasksInput = z.infer<typeof RescheduleTasksInputSchema>;

const RescheduleTasksOutputSchema = z.array(TaskSchema).describe('The rescheduled list of tasks.');

export type RescheduleTasksOutput = z.infer<typeof RescheduleTasksOutputSchema>;

export async function rescheduleTasksAfterDelay(input: RescheduleTasksInput): Promise<RescheduleTasksOutput> {
  return rescheduleTasksAfterDelayFlow(input);
}

const rescheduleTasksAfterDelayPrompt = ai.definePrompt({
  name: 'rescheduleTasksAfterDelayPrompt',
  input: {schema: RescheduleTasksInputSchema},
  output: {schema: RescheduleTasksOutputSchema},
  prompt: `You are an AI assistant that helps users reschedule their tasks when they are delayed.

  The user has been delayed and needs to reschedule their remaining tasks. Given the current tasks, the reason for the delay, and the current time, suggest a new schedule that takes into account the priority of the tasks and their deadlines.

  Current Date and Time: {{{currentDateTime}}}
  Reason for Delay: {{{delayReason}}}

  Tasks:
  {{#each tasks}}
  - ID: {{id}}
    Description: {{description}}
    Deadline: {{deadline}}
    Priority: {{priority}}
    Completed: {{completed}}
  {{/each}}

  Reschedule the tasks, taking into account the delay and the task priorities and deadlines. Do not change the id or completed status of any tasks. Return the rescheduled tasks.

  Make sure that the rescheduled tasks are returned as a JSON array of tasks.
  `,
});

const rescheduleTasksAfterDelayFlow = ai.defineFlow(
  {
    name: 'rescheduleTasksAfterDelayFlow',
    inputSchema: RescheduleTasksInputSchema,
    outputSchema: RescheduleTasksOutputSchema,
  },
  async input => {
    const {output} = await rescheduleTasksAfterDelayPrompt(input);
    return output!;
  }
);
