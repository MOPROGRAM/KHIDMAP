'use server';
/**
 * @fileOverview An AI flow to generate advertisement copy for service providers.
 *
 * - generateAd - A function that takes provider details and generates an ad.
 * - GenerateAdInput - The input type for the generateAd function.
 * - GenerateAdOutput - The return type for the generateAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateAdInputSchema = z.object({
  serviceType: z.string().describe('The primary service offered by the provider, e.g., "Plumbing", "Electrical repair".'),
  serviceAreas: z.string().describe('The cities or neighborhoods the provider serves, e.g., "Downtown, North Suburbs, West End".'),
  contactInfo: z.string().optional().describe('Contact information like a phone number or website.'),
  keywords: z.string().optional().describe('Special keywords or phrases to include, e.g., "24/7 emergency service, certified, fast and reliable".'),
  providerName: z.string().describe("The name of the service provider or their company."),
});
export type GenerateAdInput = z.infer<typeof GenerateAdInputSchema>;

const GenerateAdOutputSchema = z.object({
  title: z.string().describe("A catchy and professional headline for the advertisement."),
  body: z.string().describe("The main body text of the advertisement, written in a compelling and professional tone. It should be well-structured and easy to read."),
  imageSuggestion: z.string().describe("A brief, two or three-word suggestion for a relevant background image for the ad, e.g., 'plumber fixing sink', 'electrician working'."),
});
export type GenerateAdOutput = z.infer<typeof GenerateAdOutputSchema>;

export async function generateAd(input: GenerateAdInput): Promise<GenerateAdOutput> {
  return generateAdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdPrompt',
  input: {schema: GenerateAdInputSchema},
  output: {schema: GenerateAdOutputSchema},
  prompt: `You are a professional marketing copywriter tasked with creating a compelling advertisement for a local service provider on a directory website.

**Instructions:**
1.  Use the provided information to craft a catchy title and a clear, persuasive ad body.
2.  The tone should be professional, trustworthy, and aimed at attracting customers.
3.  Structure the ad body with clear sections (e.g., services, service areas). Use bullet points for readability where appropriate.
4.  If contact information is provided, seamlessly integrate it into the ad.
5.  Generate a short, simple suggestion for a background image that visually represents the service.

**Provider Information:**
- **Provider Name:** {{providerName}}
- **Service Type:** {{serviceType}}
- **Service Areas:** {{serviceAreas}}
- **Contact Info:** {{#if contactInfo}}{{contactInfo}}{{else}}Not Provided{{/if}}
- **Keywords/Features:** {{#if keywords}}{{keywords}}{{else}}Not Provided{{/if}}

Generate the advertisement in the specified JSON format.`,
});

const generateAdFlow = ai.defineFlow(
  {
    name: 'generateAdFlow',
    inputSchema: GenerateAdInputSchema,
    outputSchema: GenerateAdOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to generate a valid ad. Please try again.");
    }
    return output;
  }
);
