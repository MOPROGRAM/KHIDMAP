// src/ai/flows/categorize-ad.ts
'use server';

/**
 * @fileOverview Automatically categorizes a service provider's ad post into either 'Plumbing' or 'Electrical' based on the description.
 *
 * - categorizeAd - A function that takes the ad description as input and returns the determined category.
 * - CategorizeAdInput - The input type for the categorizeAd function.
 * - CategorizeAdOutput - The return type for the categorizeAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeAdInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the service provider ad post.'),
});
export type CategorizeAdInput = z.infer<typeof CategorizeAdInputSchema>;

const CategorizeAdOutputSchema = z.object({
  category:
    z.enum(['Plumbing', 'Electrical']).describe('The category of the ad.'),
});
export type CategorizeAdOutput = z.infer<typeof CategorizeAdOutputSchema>;

export async function categorizeAd(input: CategorizeAdInput): Promise<CategorizeAdOutput> {
  return categorizeAdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeAdPrompt',
  input: {schema: CategorizeAdInputSchema},
  output: {schema: CategorizeAdOutputSchema},
  prompt: `You are an expert at categorizing service provider ad posts.  Given the description of the ad post, determine whether the ad should be categorized as "Plumbing" or "Electrical".

Description: {{{description}}}

Return the category.`,
});

const categorizeAdFlow = ai.defineFlow(
  {
    name: 'categorizeAdFlow',
    inputSchema: CategorizeAdInputSchema,
    outputSchema: CategorizeAdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
