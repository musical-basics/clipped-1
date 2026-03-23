import { supabase } from "./supabase";
import { generateEmbedding } from "./ai";
import type { Note, MatchResult } from "./types";

/**
 * Save a new note and generate its embedding in the background.
 */
export async function createNote(
  userId: string,
  content: string
): Promise<Note> {
  // 1. Insert note immediately (fast UX)
  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      content,
      status: "inbox",
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Generate embedding in background (don't block the save)
  generateAndStoreEmbedding(note.id, content).catch((err) => {
    console.warn("Embedding generation failed, will retry later:", err);
  });

  return note as Note;
}

/**
 * Generate embedding for a note and store it.
 */
export async function generateAndStoreEmbedding(
  noteId: string,
  content: string
): Promise<void> {
  const embedding = await generateEmbedding(content);
  const { error } = await supabase
    .from("notes")
    .update({ embedding })
    .eq("id", noteId);

  if (error) throw error;
}

/**
 * Update a note's status (inbox → stored, inbox → archived, etc.)
 */
export async function updateNoteStatus(
  noteId: string,
  status: "inbox" | "stored" | "archived"
): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .update({ status })
    .eq("id", noteId);

  if (error) throw error;
}

/**
 * Update a note's content and regenerate its embedding.
 */
export async function updateNoteContent(
  noteId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  if (error) throw error;

  // Regenerate embedding for the updated content
  generateAndStoreEmbedding(noteId, content).catch((err) => {
    console.warn("Embedding regeneration failed:", err);
  });
}

/**
 * Find semantically similar stored notes using vector search.
 */
export async function findSimilarNotes(
  embedding: number[],
  userId: string,
  threshold = 0.5,
  count = 3
): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc("match_notes", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: count,
    current_user_id: userId,
  });

  if (error) throw error;
  return (data ?? []) as MatchResult[];
}

/**
 * Merge a child note into a parent note.
 */
export async function mergeNotes(
  parentId: string,
  childNote: Note
): Promise<void> {
  // 1. Get parent content
  const { data: parent, error: fetchErr } = await supabase
    .from("notes")
    .select("content")
    .eq("id", parentId)
    .single();

  if (fetchErr) throw fetchErr;

  // 2. Merge content
  const mergedContent = `${parent.content}\n\n---\n\n${childNote.content}`;

  // 3. Update parent
  const { error: updateErr } = await supabase
    .from("notes")
    .update({ content: mergedContent, updated_at: new Date().toISOString() })
    .eq("id", parentId);

  if (updateErr) throw updateErr;

  // 4. Archive child
  await updateNoteStatus(childNote.id, "archived");

  // 5. Log merge event
  await supabase.from("merge_events").insert({
    parent_note_id: parentId,
    child_note_id: childNote.id,
  });

  // 6. Regenerate parent embedding
  generateAndStoreEmbedding(parentId, mergedContent).catch(console.warn);
}

/**
 * Backfill embeddings for notes that are missing them.
 */
export async function backfillEmbeddings(userId: string): Promise<number> {
  const { data: notes } = await supabase
    .from("notes")
    .select("id, content")
    .eq("user_id", userId)
    .is("embedding", null);

  if (!notes || notes.length === 0) return 0;

  let count = 0;
  for (const note of notes) {
    try {
      await generateAndStoreEmbedding(note.id, note.content);
      count++;
    } catch (err) {
      console.warn(`Backfill failed for note ${note.id}:`, err);
    }
  }

  return count;
}
