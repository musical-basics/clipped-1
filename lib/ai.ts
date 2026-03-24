// AI helper functions for embedding generation and note cleanup
import { Platform } from "react-native";

const EMBEDDING_MODEL = "text-embedding-3-small";
const CLEANUP_MODEL = "gpt-4o-mini";

const CLEANUP_SYSTEM_PROMPT = `You are a note-formatting assistant. The user will give you raw, 
unstructured notes that may contain fragments, run-on sentences, and merged thoughts. 
Your job is to:
1. Organize the content into logical sections.
2. Use clear bullet points and sub-bullets.
3. Fix grammar and spelling without changing meaning.
4. Preserve ALL information — do not remove or summarize away any content.
Return only the formatted note content, no preamble.`;

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");
  }

  if (Platform.OS === "web") {
    throw new Error("AI features require the native app (OpenAI blocks browser requests)");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export interface CleanupResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
  cost: number; // USD
}

// gpt-4o-mini pricing per 1M tokens
const CLEANUP_INPUT_COST = 0.15; // $0.15 per 1M input tokens
const CLEANUP_OUTPUT_COST = 0.60; // $0.60 per 1M output tokens

/**
 * Use an LLM to clean up and organize messy note content.
 * Returns cleaned content + token usage stats.
 */
export async function cleanupNote(content: string): Promise<CleanupResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");
  }

  if (Platform.OS === "web") {
    throw new Error("AI Clean Up requires the native app. OpenAI blocks browser requests due to CORS.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CLEANUP_MODEL,
      messages: [
        { role: "system", content: CLEANUP_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cleanup API error: ${response.status}`);
  }

  const data = await response.json();
  const tokensIn = data.usage?.prompt_tokens ?? 0;
  const tokensOut = data.usage?.completion_tokens ?? 0;
  const cost = (tokensIn * CLEANUP_INPUT_COST + tokensOut * CLEANUP_OUTPUT_COST) / 1_000_000;

  return {
    content: data.choices[0].message.content,
    tokensIn,
    tokensOut,
    cost,
  };
}
