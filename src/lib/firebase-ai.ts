import { getAI, getGenerativeModel, GoogleAIBackend, type GenerativeModel } from 'firebase/ai';
import app from './firebase';

/**
 * Firebase AI Logic SDK Configuration
 * Uses Gemini API through Firebase AI Logic SDK
 * Reference: https://firebase.google.com/docs/ai-logic/get-started?platform=web
 */

// Initialize the Gemini Developer API backend service
let aiInstance: ReturnType<typeof getAI> | null = null;
let generativeModel: GenerativeModel | null = null;

function getAIInstance() {
    if (!app) {
        throw new Error('Firebase app is not initialized. Please check your Firebase configuration.');
    }

    if (!aiInstance) {
        aiInstance = getAI(app, { backend: new GoogleAIBackend() });
    }

    return aiInstance;
}

/**
 * Get or create a GenerativeModel instance
 * Uses Gemini 2.5 Flash model - latest and efficient
 */
export function getGeminiModel(): GenerativeModel {
    if (!generativeModel) {
        const ai = getAIInstance();
        generativeModel = getGenerativeModel(ai, {
            model: 'gemini-2.5-flash'
        });
    }

    return generativeModel;
}

/**
 * Generate content using Gemini API
 */
export async function generateContent(prompt: string): Promise<string> {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Firebase AI Logic SDK Error:', error);
        throw error;
    }
}

/**
 * Generate structured JSON content using Gemini API
 */
export async function generateStructuredContent<T>(
    prompt: string,
    responseSchema?: string
): Promise<T> {
    try {
        const model = getGeminiModel();

        // Add schema instruction if provided
        const fullPrompt = responseSchema
            ? `${prompt}\n\nReturn the response as valid JSON matching this schema: ${responseSchema}`
            : `${prompt}\n\nReturn the response as valid JSON.`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        try {
            return JSON.parse(text) as T;
        } catch (parseError) {
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]) as T;
            }
            throw new Error('Failed to parse AI response as JSON');
        }
    } catch (error) {
        console.error('Firebase AI Logic SDK Structured Content Error:', error);
        throw error;
    }
}
