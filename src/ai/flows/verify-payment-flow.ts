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
  expectedPayeeName: z.string().describe("The name of the person or entity expected to have received the payment (the service provider)."),
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
  prompt: `You are an AI assistant for a financial services platform. Your role is to verify payment receipts uploaded by users. You must be very careful and precise.

**Task**:
Analyze the receipt image and compare it with the expected transaction details to determine if the payment is valid.

**Image to Analyze**:
{{media url=photoDataUri}}

**Expected Transaction Details**:
- **Payer (Sender)**: {{expectedPayerName}}
- **Payee (Recipient)**: {{expectedPayeeName}}
- **Amount**: {{expectedAmount}}
- **Currency**: {{expectedCurrency}}

**Instructions**:
1.  **Extract Information**: Carefully examine the image to find the following:
    - The sender's name (Payer).
    - The recipient's name (Payee).
    - The total amount transferred.
    - The currency (e.g., USD, SAR, $, ر.س).
2.  **Populate Found Fields**: Fill the \`foundAmount\`, \`foundCurrency\`, and \`foundPayerName\` fields with the data you extract from the image. If you cannot find a piece of information, leave its corresponding field blank.
3.  **Compare and Decide**:
    - **Amount**: The \`foundAmount\` must match the \`expectedAmount\` exactly.
    - **Currency**: The \`foundCurrency\` must match the \`expectedCurrency\` (e.g., 'SAR' matches 'ر.س').
    - **Payer**: The \`foundPayerName\` should be a plausible match for the \`expectedPayerName\`. A partial match is acceptable (e.g., 'Mohammed Ahmed' matches 'Mohammed').
    - **Payee**: The recipient on the receipt should plausibly match the \`expectedPayeeName\`.
4.  **Set Verification Status**:
    - Set \`isVerified\` to \`true\` **ONLY IF** Amount and Currency match, AND the Payer name is a reasonable match.
    - If there is any doubt, if numbers are unclear, or if any of the key items do not match, set \`isVerified\` to \`false\`.
5.  **Provide a Clear Reason**:
    - If verified, set \`reason\` to: "AI Approved: Amount, currency, and payer name appear to match."
    - If not verified, explain **exactly what the mismatch is**. For example: "AI Rejected: Amount found was {{foundAmount}} but expected was {{expectedAmount}}." or "AI Rejected: Payer name '{{foundPayerName}}' does not sufficiently match expected '{{expectedPayerName}}'." or "AI Rejected: Image is unclear or not a valid receipt."

Your final output must be in the specified JSON format.`,
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
