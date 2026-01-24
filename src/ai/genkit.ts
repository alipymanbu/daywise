import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Configure Genkit with Google AI (Gemini)
 * This works seamlessly with Firebase projects and uses the same infrastructure as Vertex AI
 * The Google AI plugin provides access to Gemini models which are the same models available in Vertex AI
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash-exp', // Latest Gemini model - fast and efficient
  enableTracing: true, // Enable tracing for debugging AI calls
});
