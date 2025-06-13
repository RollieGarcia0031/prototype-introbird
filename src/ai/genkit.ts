
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // openAI({
    //   apiKey: process.env.OPENAI_API_KEY, // User needs to set this in their environment
    // }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model
});

// Define model identifiers that will be used in the UI and flows
export const AVAILABLE_MODELS = {
  GEMINI_FLASH: 'googleai/gemini-2.0-flash',
  // OPENAI_GPT4O_MINI: 'openai/gpt-4o-mini', // Example OpenAI model
};

