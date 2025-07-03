'use server';
/**
 * @fileOverview An AI flow to verify payment receipts.
 *
 * - verifyPayment - A function that analyzes a payment proof image against expected values.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const VerifyPaymentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the payment receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expectedAmount: z.number().describe("The expected payment amount."),
  expectedCurrency: z.string().describe("The expected currency code (e.g., USD, SAR)."),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isVerified: z.boolean().describe("Whether the payment is verified to match the expected amount and currency."),
  reason: z.string().describe("A brief explanation for why the verification succeeded or failed."),
  foundAmount: z.number().optional().describe("The amount found in the receipt."),
  foundCurrency: z.string().optional().describe("The currency found in the receipt."),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentPrompt',
  input: {schema: VerifyPaymentInputSchema},
  output: {schema: VerifyPaymentOutputSchema},
  prompt: `You are a meticulous financial auditor AI. Your task is to analyze the provided image of a payment receipt and verify if it matches an expected transaction.

Analyze the image provided in '{{media url=photoDataUri}}'.

The expected payment is:
- Amount: {{expectedAmount}}
- Currency: {{expectedCurrency}}

Carefully examine the receipt image to find the total amount paid and the currency. The amount might be labeled as "Total", "Amount Paid", or similar. The currency might be a symbol ($, €, ر.س) or a code (USD, SAR, EGP).

Your response MUST be in the structured format defined.

1.  **isVerified**: Set to 'true' ONLY if the amount AND currency you find in the image EXACTLY match the expected values. If there is any doubt, or if the numbers are unclear, or if the currency is wrong, set it to 'false'.
2.  **reason**: Provide a concise reason for your decision.
    - If verified, state something like: "Verified: Found matching amount and currency in the receipt."
    - If not verified, explain why, for example: "Failed: The amount in the receipt was [found_amount], but expected {{expectedAmount}}." OR "Failed: Currency not found or does not match." OR "Failed: The image is unclear or does not appear to be a valid receipt."
3.  **foundAmount / foundCurrency**: Fill these fields with the values you extracted from the receipt, if possible.

Proceed with the analysis.`,
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("AI model did not return a valid structured output.");
        }
        return output;
    } catch(e: any) {
        console.error("Error during AI payment verification flow:", e);
        // Return a structured error response
        return {
            isVerified: false,
            reason: `AI analysis failed due to an internal error: ${e.message}. Please review manually.`,
            foundAmount: 0,
            foundCurrency: ''
        };
    }
  }
);
