'use server';
/**
 * @fileOverview An AI flow to automatically categorize a service provider based on their bio.
 *
 * - categorizeProvider - A function that analyzes a description and returns a service category.
 * - CategorizeProviderInput - The input type for the categorizeProvider function.
 * - CategorizeProviderOutput - The return type for the categorizeProvider function.
 */

import {z} from 'zod';
import type { ServiceCategory } from '@/lib/data';
// import genkit from 'genkit'; // Temporarily commented out due to import issues

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
  // Temporarily returning a default category due to Genkit import issues.
  // This flow needs to be re-evaluated for proper Genkit integration.
  console.warn('categorizeProviderFlow is temporarily disabled due to Genkit import issues.');
  return { category: 'Other' };
}

// The following Genkit-related code is commented out due to import/compilation issues.
/*
const prompt = genkit.definePrompt({
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

const categorizeProviderFlow = genkit.defineFlow(
  {
    name: 'categorizeProviderFlow',
    inputSchema: CategorizeProviderInputSchema,
    outputSchema: CategorizeProviderOutputSchema,
  },
  async (input: CategorizeProviderInput) => {
    if (!input.description.trim()) {
        return { category: 'Other' };
    }
    const {output} = await prompt(input);
    return output || { category: 'Other' };
  }
);
*/
