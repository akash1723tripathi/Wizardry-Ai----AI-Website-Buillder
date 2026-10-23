import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});
export default openai;

// Free OpenRouter models get retired or rate-limited without notice, so every call walks
// a fallback chain. Override with AI_MODELS="model-a,model-b" in .env.
const DEFAULT_MODELS = [
  "cohere/north-mini-code:free",
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

export const AI_MODELS = (process.env.AI_MODELS?.split(',').map((m) => m.trim()).filter(Boolean)) || DEFAULT_MODELS;

const REQUEST_TIMEOUT_MS = 4 * 60 * 1000;

interface CompletionOptions {
  maxTokens?: number;
  // Return false to reject a response (e.g. no HTML in it) and move on to the next model
  accept?: (content: string) => boolean;
}

// Free models are shared by every OpenRouter user and throttle in short bursts (429), so when
// the whole chain fails we wait and walk it again before giving up (~1.5 min worst case)
const RETRY_DELAYS_MS = [8000, 25000, 45000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateCompletion = async (messages: ChatCompletionMessageParam[], { maxTokens, accept }: CompletionOptions = {}) => {
  const failures: string[] = [];

  for (let round = 0; round <= RETRY_DELAYS_MS.length; round++) {
    if (round > 0) await sleep(RETRY_DELAYS_MS[round - 1]);

    for (const model of AI_MODELS) {
      const started = Date.now();
      const seconds = () => `${((Date.now() - started) / 1000).toFixed(1)}s`;
      try {
        const response = await openai.chat.completions.create(
          { model, messages, ...(maxTokens ? { max_tokens: maxTokens } : {}) },
          { timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 }
        );
        const choice = response.choices[0];
        const content = choice?.message?.content?.trim() || '';

        // "length" means the answer was cut off (reasoning models can spend the whole budget thinking)
        if (choice?.finish_reason === 'length') {
          failures.push(`round ${round + 1} ${model}: cut off at max_tokens after ${seconds()}`);
        } else if (content && (!accept || accept(content))) {
          console.log(`AI: ${model} answered in ${seconds()} (round ${round + 1})`);
          return content;
        } else {
          failures.push(`round ${round + 1} ${model}: unusable response after ${seconds()}`);
        }
      } catch (error: any) {
        failures.push(`round ${round + 1} ${model}: ${error?.status || ''} ${error?.message || error} after ${seconds()}`.trim());
      }
      console.log(`AI: ${failures[failures.length - 1]}`);
    }
  }

  console.log('AI generation failed on every model:\n  ' + failures.join('\n  '));
  throw new Error('The AI service is busy right now. Please try again in a minute.');
};

// Models sometimes wrap the page in markdown fences or add a sentence before it
export const extractHtml = (content: string) => {
  const cleaned = content.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.search(/<!doctype html|<html/i);
  const end = cleaned.toLowerCase().lastIndexOf('</html>');
  if (start === -1) return '';
  return end > start ? cleaned.slice(start, end + '</html>'.length) : cleaned.slice(start);
};

// A complete page, not one that stopped part-way through
export const looksLikeHtml = (content: string) => {
  const html = extractHtml(content);
  return html.length > 200 && /<\/html>\s*$/i.test(html);
};

// Stored as the last chat message when generation fails; the builder looks for it to stop waiting
export const GENERATION_FAILED_MESSAGE = "I couldn't generate your website";
