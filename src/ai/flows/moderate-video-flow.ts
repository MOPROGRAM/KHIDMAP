'use server';
/**
 * @fileOverview An AI flow to moderate videos for safety using built-in safety filters.
 *
 * - moderateVideo - A function that checks if a video is safe.
 * - ModerateVideoInput - The input type for the moderateVideo function.
 * - ModerateVideoOutput - The return type for the moderateVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video to be moderated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ModerateVideoInput = z.infer<typeof ModerateVideoInputSchema>;

const ModerateVideoOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether or not the video is considered safe.'),
});
export type ModerateVideoOutput = z.infer<typeof ModerateVideoOutputSchema>;

export async function moderateVideo(input: ModerateVideoInput): Promise<ModerateVideoOutput> {
  return moderateVideoFlow(input);
}

// This is a simplified approach. True video moderation often requires
// frame-by-frame analysis, which is more complex. We are relying on the
// model's ability to process video data for safety flags directly.
const moderateVideoFlow = ai.defineFlow(
  {
    name: 'moderateVideoFlow',
    inputSchema: ModerateVideoInputSchema,
    outputSchema: ModerateVideoOutputSchema,
  },
  async (input) => {
    try {
      // We generate text with the video as input. The key is to check the safety feedback.
      const response = await ai.generate({
        prompt: [
          {text: 'Analyze this video for safety.'},
          {media: {url: input.videoDataUri}},
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
      // If the API call itself throws a safety error, the video is definitely not safe.
      if (e.message.includes('SAFETY')) {
        return { isSafe: false };
      }
      // For other errors, we can decide to fail open or closed. Failing closed (unsafe) is safer.
      console.error('Video moderation flow failed with non-safety error:', e);
      return { isSafe: false };
    }
  }
);
