'use server';
/**
 * @fileOverview An AI flow to automatically categorize a service provider based on their bio.
 *
 * - categorizeProvider - A function that analyzes a description and returns a service category.
 * - CategorizeProviderInput - The input type for the categorizeProvider function.
 * - CategorizeProviderOutput - The return type for the categorizeProvider function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { ServiceCategory } from '@/lib/data';

const CategorizeProviderInputSchema = z.object({
  description: z.string().describe('The provider\'s qualifications, bio, or service description.'),
});
export type CategorizeProviderInput = z.infer<typeof CategorizeProviderInputSchema>;

// We limit the categories for this flow to the main ones for auto-detection.
const CategorizeProviderOutputSchema = z.object({
  category: z.enum(['Plumbing', 'Electrical', 'Other']).describe("The most relevant service category for the provider.")
});
export type CategorizeProviderOutput = z.infer<typeof CategorizeProviderOutputSchema>;

export async function categorizeProvider(input: CategorizeProviderInput): Promise<CategorizeProviderOutput> {
  return categorizeProviderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeProviderPrompt',
  input: {schema: CategorizeProviderInputSchema},
  output: {schema: CategorizeProviderOutputSchema},
  prompt: `You are an expert at categorizing service providers for a directory app. Your task is to analyze the provider's description and determine their primary service category.

The available categories are "Plumbing", "Electrical", and "Other".

- If the description clearly indicates plumbing services (pipes, water heaters, drains, faucets, toilets), choose "Plumbing".
- If the description clearly indicates electrical services (wiring, circuits, outlets, lighting, panels), choose "Electrical".
- For any other trade (like carpentry, painting) or if the description is too generic or unclear, choose "Other".

Analyze the following description and determine the most fitting category.

Description: {{{description}}}
`,
});

const categorizeProviderFlow = ai.defineFlow(
  {
    name: 'categorizeProviderFlow',
    inputSchema: CategorizeProviderInputSchema,
    outputSchema: CategorizeProviderOutputSchema,
  },
  async (input) => {
    if (!input.description.trim()) {
        return { category: 'Other' };
    }
    const {output} = await prompt(input);
    return output || { category: 'Other' };
  }
);
