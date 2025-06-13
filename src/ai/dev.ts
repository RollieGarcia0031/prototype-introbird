import { config } from 'dotenv';
config();

import '@/ai/flows/generate-reply-suggestions.ts';
import '@/ai/flows/summarize-email.ts';
import '@/ai/flows/improve-reply-draft.ts';
import '@/ai/flows/refine-draft-with-instruction.ts';
