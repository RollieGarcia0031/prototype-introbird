
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model
});

// AVAILABLE_MODELS has been moved to src/ai/model-definitions.ts
// to prevent pulling server-side initialization into client bundles.
