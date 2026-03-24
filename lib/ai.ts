import { supabase } from "./supabase";

export interface CleanupResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 * Securely calls our Supabase Edge Function instead of OpenAI directly.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { data, error } = await supabase.functions.invoke("ai-tools", {
    body: { action: "embed", text },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error("Failed to generate embedding");
  }

  return data.embedding;
}

/**
 * Use an LLM to clean up and organize messy note content.
 * Securely calls our Supabase Edge Function instead of OpenAI directly.
 */
export async function cleanupNote(content: string): Promise<CleanupResult> {
  const { data, error } = await supabase.functions.invoke("ai-tools", {
    body: { action: "cleanup", text: content },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error("Failed to clean up note");
  }

  return {
    content: data.content,
    tokensIn: data.tokensIn,
    tokensOut: data.tokensOut,
    cost: data.cost,
  };
}
