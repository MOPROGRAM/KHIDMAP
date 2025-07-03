'use server';
/**
 * @fileOverview An AI flow to verify payment receipts with multiple checks.
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
  expectedPayerName: z.string().describe("The name of the person expected to have made the payment (the service seeker)."),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isVerified: z.boolean().describe("Whether the payment is verified to match all expected details (amount, currency, and payer name)."),
  reason: z.string().describe("A brief explanation for why the verification succeeded or failed, covering all checks."),
  foundAmount: z.number().optional().describe("The amount found in the receipt."),
  foundCurrency: z.string().optional().describe("The currency found in the receipt."),
  foundPayerName: z.string().optional().describe("The name of the payer or account holder found on the receipt."),
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
- Payer Name: {{expectedPayerName}}
- Amount: {{expectedAmount}}
- Currency: {{expectedCurrency}}

Carefully examine the receipt image to find the following information:
1.  **Payer's Name**: Look for a sender name, account holder name, or similar identifier.
2.  **Total Amount Paid**: This might be labeled as "Total", "Amount Paid", etc.
3.  **Currency**: This might be a symbol ($, €, ر.س) or a code (USD, SAR, EGP).

Your response MUST be in the structured format defined.

1.  **isVerified**: Set to 'true' ONLY IF the amount, currency, AND payer's name in the image EXACTLY match the expected values. The name can be a partial match (e.g., 'Mohammed' matches 'Mohammed Ahmed'). If there is any doubt, if numbers are unclear, or if any of the three items do not match, set it to 'false'.
2.  **reason**: Provide a concise reason for your decision.
    - If verified, state: "Verified: Found matching name, amount, and currency."
    - If not verified, explain exactly what failed, for example: "Failed: Amount was [found_amount], expected {{expectedAmount}}." OR "Failed: Payer name '{{foundPayerName}}' does not match expected '{{expectedPayerName}}'." OR "Failed: Image is unclear or not a valid receipt."
3.  **foundAmount / foundCurrency / foundPayerName**: Fill these fields with the values you extracted from the receipt, if possible.

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
        };
    }
  }
);
