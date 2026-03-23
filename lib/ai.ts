// AI helper functions for embedding generation and note cleanup

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

/**
 * Use an LLM to clean up and organize messy note content.
 */
export async function cleanupNote(content: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");
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
  return data.choices[0].message.content;
}
