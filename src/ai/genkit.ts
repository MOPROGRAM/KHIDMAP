import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "", // Add your API key here
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
