import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLEANUP_SYSTEM_PROMPT = `You are a note-formatting assistant. The user will give you raw, 
unstructured notes that may contain fragments, run-on sentences, and merged thoughts. 
Your job is to:
1. Organize the content into logical sections.
2. Use clear bullet points and sub-bullets.
3. Fix grammar and spelling without changing meaning.
4. Preserve ALL information — do not remove or summarize away any content.
Return only the formatted note content, no preamble.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, text } = await req.json();
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAiKey) {
      throw new Error("Missing OpenAI API Key on server.");
    }

    if (action === "embed") {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ embedding: data.data[0].embedding }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } 
    
    if (action === "cleanup") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: CLEANUP_SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      
      const tokensIn = data.usage?.prompt_tokens ?? 0;
      const tokensOut = data.usage?.completion_tokens ?? 0;
      const cost = (tokensIn * 0.15 + tokensOut * 0.60) / 1_000_000;

      return new Response(
        JSON.stringify({ 
          content: data.choices[0].message.content,
          tokensIn,
          tokensOut,
          cost
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
