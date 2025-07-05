import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "AIzaSyAvnbo3SEVL8NNky4E3TD-HUlQhaMxQKT0", // Add your API key here
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
