import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import SwipeCard from "../../components/SwipeCard";
import MergeSheet from "../../components/MergeSheet";
import { supabase } from "../../lib/supabase";
import { updateNoteStatus, findSimilarNotes, mergeNotes } from "../../lib/notes";
import { useAuth } from "../../lib/auth";
import type { Note, MatchResult } from "../../lib/types";
import { colors, fontSize, spacing } from "../../lib/theme";

export default function ReviewScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Merge state
  const [mergeNote, setMergeNote] = useState<Note | null>(null);
  const [mergeMatches, setMergeMatches] = useState<MatchResult[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);

  const loadInboxNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "inbox")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setNotes(data as Note[]);
      setCurrentIndex(0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadInboxNotes();
  }, [loadInboxNotes]);

  const advanceCard = () => {
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 350);
  };

  const handleSwipeLeft = async (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateNoteStatus(note.id, "archived");
    } catch (err) {
      console.error("Archive error:", err);
    }
    advanceCard();
  };

  const handleSwipeRight = async (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateNoteStatus(note.id, "stored");
    } catch (err) {
      console.error("Store error:", err);
    }
    advanceCard();
  };

  const handleSwipeUp = async (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMergeNote(note);
    setMergeLoading(true);
    setMergeMatches([]);

    try {
      if (!note.embedding || !user) {
        setMergeMatches([]);
        return;
      }
      const matches = await findSimilarNotes(note.embedding, user.id);
      setMergeMatches(matches);
    } catch (err) {
      console.error("Vector search error:", err);
      setMergeMatches([]);
    } finally {
      setMergeLoading(false);
    }
  };

  const handleMergeSelect = async (parentId: string) => {
    if (!mergeNote) return;

    try {
      await mergeNotes(parentId, mergeNote);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Merge error:", err);
    }

    setMergeNote(null);
    setMergeMatches([]);
    advanceCard();
  };

  const handleMergeClose = () => {
    setMergeNote(null);
    setMergeMatches([]);
    // If user closes merge sheet without selecting, store the note instead
    if (mergeNote) {
      updateNoteStatus(mergeNote.id, "stored").catch(console.error);
      advanceCard();
    }
  };

  const remainingNotes = notes.slice(currentIndex);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (remainingNotes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            No notes in your inbox. Capture some thoughts first.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadInboxNotes}
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentNote = remainingNotes[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {notes.length}
        </Text>
      </View>

      <View style={styles.hints}>
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => currentNote && handleSwipeLeft(currentNote)}
          activeOpacity={0.6}
        >
          <Text style={[styles.hint, { color: colors.swipeDelete }]}>
            ← Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => currentNote && handleSwipeUp(currentNote)}
          activeOpacity={0.6}
        >
          <Text style={[styles.hint, { color: colors.swipeMerge }]}>
            ↑ Merge
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => currentNote && handleSwipeRight(currentNote)}
          activeOpacity={0.6}
        >
          <Text style={[styles.hint, { color: colors.swipeKeep }]}>
            Keep →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {remainingNotes
          .slice(0, 3)
          .reverse()
          .map((note, reverseIdx) => {
            const stackIndex =
              Math.min(remainingNotes.length - 1, 2) - reverseIdx;
            return (
              <SwipeCard
                key={note.id}
                content={note.content}
                index={stackIndex}
                onSwipeLeft={() => handleSwipeLeft(note)}
                onSwipeRight={() => handleSwipeRight(note)}
                onSwipeUp={() => handleSwipeUp(note)}
              />
            );
          })}
      </View>

      <MergeSheet
        visible={mergeNote !== null}
        matches={mergeMatches}
        loading={mergeLoading}
        onSelect={handleMergeSelect}
        onClose={handleMergeClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: "800",
  },
  counter: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  hints: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  hint: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    opacity: 0.7,
  },
  hintButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  refreshButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 100,
  },
  refreshText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
