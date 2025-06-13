
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai'; // Commented out due to install issues

export const ai = genkit({
  plugins: [
    googleAI(),
    // openAI(), // Commented out due to install issues
  ],
  model: 'googleai/gemini-2.0-flash', // Default model
});

// AVAILABLE_MODELS has been moved to src/ai/model-definitions.ts
// to prevent pulling server-side initialization into client bundles.
