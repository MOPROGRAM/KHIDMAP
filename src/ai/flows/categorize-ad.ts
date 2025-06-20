
// src/ai/flows/categorize-ad.ts
'use server';

/**
 * @fileOverview Automatically categorizes a service provider's ad post into 'Plumbing', 'Electrical', 'Carpentry', 'Painting', or 'HomeCleaning' based on the description.
 *
 * - categorizeAd - A function that takes the ad description as input and returns the determined category.
 * - CategorizeAdInput - The input type for the categorizeAd function.
 * - CategorizeAdOutput - The return type for the categorizeAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ServiceCategory } from '@/lib/data'; // Ensure ServiceCategory type is imported if needed elsewhere

const serviceCategoriesEnum = z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Other']);
export type ServiceCategoriesEnumType = z.infer<typeof serviceCategoriesEnum>;


const CategorizeAdInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the service provider ad post.'),
});
export type CategorizeAdInput = z.infer<typeof CategorizeAdInputSchema>;

const CategorizeAdOutputSchema = z.object({
  category: serviceCategoriesEnum.describe('The category of the ad. Should be one of Plumbing, Electrical, Carpentry, Painting, HomeCleaning, or Other if none fit well.'),
});
export type CategorizeAdOutput = z.infer<typeof CategorizeAdOutputSchema>;

export async function categorizeAd(input: CategorizeAdInput): Promise<CategorizeAdOutput> {
  return categorizeAdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeAdPrompt',
  input: {schema: CategorizeAdInputSchema},
  output: {schema: CategorizeAdOutputSchema},
  prompt: `You are an expert at categorizing service provider ad posts. Given the description of the ad post, determine which of the following categories the ad best fits: "Plumbing", "Electrical", "Carpentry", "Painting", "HomeCleaning", or "Other".

Description: {{{description}}}

Return only the determined category name. If the description doesn't clearly fit one of the primary categories, classify it as "Other".`,
});

const categorizeAdFlow = ai.defineFlow(
  {
    name: 'categorizeAdFlow',
    inputSchema: CategorizeAdInputSchema,
    outputSchema: CategorizeAdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        // Fallback or error handling if prompt returns no output
        console.warn("AI categorization returned no output, defaulting to 'Other'");
        return { category: 'Other' as ServiceCategoriesEnumType };
    }
    // Ensure the output category is one of the allowed enum values, otherwise default to 'Other'
    // This is a safeguard in case the LLM returns something unexpected despite the prompt.
    const isValidCategory = serviceCategoriesEnum.safeParse(output.category).success;
    if (!isValidCategory) {
        console.warn(`AI returned an invalid category: ${output.category}. Defaulting to 'Other'.`);
        return { category: 'Other' as ServiceCategoriesEnumType };
    }

    return output;
  }
);
