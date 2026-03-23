import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";
import { updateNoteContent } from "../../lib/notes";
import { cleanupNote } from "../../lib/ai";
import { generateAndStoreEmbedding } from "../../lib/notes";
import { colors, fontSize, spacing, radius } from "../../lib/theme";
import type { Note } from "../../lib/types";

function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setNote(data as Note);
      setContent(data.content);
    }
    setLoading(false);
  };

  const debouncedSave = useMemo(
    () =>
      debounce(async (newContent: string) => {
        if (!id) return;
        await updateNoteContent(id, newContent);
      }, 1500),
    [id]
  );

  const handleContentChange = (text: string) => {
    setContent(text);
    debouncedSave(text);
  };

  const handleCleanup = async () => {
    if (!id || !content.trim()) return;

    setCleaning(true);
    try {
      const cleaned = await cleanupNote(content);
      setOriginalContent(content);
      setContent(cleaned);
      await updateNoteContent(id, cleaned);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show undo option for 10 seconds
      setShowUndo(true);
      undoTimer.current = setTimeout(() => {
        setShowUndo(false);
        setOriginalContent(null);
      }, 10000);
    } catch (err) {
      Alert.alert("Cleanup Failed", "Please try again.");
      console.error("Cleanup error:", err);
    } finally {
      setCleaning(false);
    }
  };

  const handleUndo = async () => {
    if (!id || !originalContent) return;
    clearTimeout(undoTimer.current);
    setContent(originalContent);
    await updateNoteContent(id, originalContent);
    setOriginalContent(null);
    setShowUndo(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Note not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          Last updated: {new Date(note.updated_at).toLocaleDateString()}
        </Text>
        <Text style={styles.metaText}>{content.length} chars</Text>
      </View>

      <ScrollView style={styles.scrollContainer} keyboardDismissMode="on-drag">
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={handleContentChange}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          placeholder="Write something..."
          placeholderTextColor={colors.textMuted}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        {showUndo && (
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            <Text style={styles.undoText}>↩ Undo Cleanup</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.cleanupButton, cleaning && styles.cleanupDisabled]}
          onPress={handleCleanup}
          disabled={cleaning}
          activeOpacity={0.8}
        >
          {cleaning ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Text style={styles.cleanupText}>✨ Clean Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  contentInput: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    lineHeight: 28,
    padding: spacing.lg,
    minHeight: 300,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  undoButton: {
    backgroundColor: colors.warning + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  undoText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  cleanupButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    minWidth: 120,
    alignItems: "center",
  },
  cleanupDisabled: {
    opacity: 0.6,
  },
  cleanupText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
