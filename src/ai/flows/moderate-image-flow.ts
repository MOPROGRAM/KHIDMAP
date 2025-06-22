'use server';
/**
 * @fileOverview An AI flow to moderate images for safety using built-in safety filters.
 *
 * - moderateImage - A function that checks if an image is safe.
 * - ModerateImageInput - The input type for the moderateImage function.
 * - ModerateImageOutput - The return type for the moderateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be moderated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ModerateImageInput = z.infer<typeof ModerateImageInputSchema>;

const ModerateImageOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether or not the image is considered safe.'),
});
export type ModerateImageOutput = z.infer<typeof ModerateImageOutputSchema>;

export async function moderateImage(input: ModerateImageInput): Promise<ModerateImageOutput> {
  return moderateImageFlow(input);
}

const moderateImageFlow = ai.defineFlow(
  {
    name: 'moderateImageFlow',
    inputSchema: ModerateImageInputSchema,
    outputSchema: ModerateImageOutputSchema,
  },
  async (input) => {
    try {
      // We generate text with the image as input. The key is to check the safety feedback.
      const response = await ai.generate({
        prompt: [
          {text: 'Analyze this image for safety.'},
          {media: {url: input.photoDataUri}},
        ],
        config: {
          // Strictest safety settings
          safetySettings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
          ],
        },
      });

      // Check if the response was blocked.
      const isBlocked = response.usage.output?.safetyFeedback?.some(
        (feedback) => feedback.rating.probability === 'HIGH'
      );

      if (isBlocked) {
        return { isSafe: false };
      }

      return { isSafe: true };
    } catch (e: any) {
      // If the API call itself throws a safety error, the image is definitely not safe.
      if (e.message.includes('SAFETY')) {
        return { isSafe: false };
      }
      // For other errors, we can decide to fail open or closed. Failing closed (unsafe) is safer.
      console.error('Moderation flow failed with non-safety error:', e);
      return { isSafe: false };
    }
  }
);
