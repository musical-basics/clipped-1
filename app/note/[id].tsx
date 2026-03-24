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
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";
import { updateNoteContent, updateNoteStatus } from "../../lib/notes";
import { cleanupNote } from "../../lib/ai";
import { generateAndStoreEmbedding } from "../../lib/notes";
import { colors, fontSize, spacing, radius } from "../../lib/theme";
import type { Note } from "../../lib/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function debounce<T extends (...args: any[]) => any>(
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
  const [cleanupCost, setCleanupCost] = useState<{ tokensIn: number; tokensOut: number; cost: number } | null>(null);
  const undoTimer = useRef<NodeJS.Timeout>();

  // Delete animation
  const [deleting, setDeleting] = useState(false);
  const deleteScale = useRef(new Animated.Value(1)).current;
  const deleteX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (id) loadNote();
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
      const result = await cleanupNote(content);
      setOriginalContent(content);
      setContent(result.content);
      setCleanupCost({ tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: result.cost });
      await updateNoteContent(id, result.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowUndo(true);
      undoTimer.current = setTimeout(() => {
        setShowUndo(false);
        setOriginalContent(null);
        setCleanupCost(null);
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
    setCleanupCost(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = Platform.OS === "web"
      ? window.confirm("Delete this note? It will be archived.")
      : await new Promise<boolean>((resolve) =>
          Alert.alert("Delete Note", "This note will be archived.", [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Delete", style: "destructive", onPress: () => resolve(true) },
          ])
        );
    if (!confirmed) return;

    setDeleting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await updateNoteStatus(id, "archived");

    Animated.parallel([
      Animated.timing(deleteScale, { toValue: 0.1, duration: 400, useNativeDriver: true }),
      Animated.timing(deleteX, { toValue: -SCREEN_WIDTH * 0.4, duration: 400, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(deleteOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      router.back();
    });
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
    <Animated.View
      style={[
        styles.container,
        {
          opacity: deleteOpacity,
          transform: [
            { scale: deleteScale },
            { translateX: deleteX },
          ],
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
          <View style={styles.bottomLeft}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>🗑</Text>
            </TouchableOpacity>
            {showUndo && (
              <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
                <Text style={styles.undoText}>↩ Undo</Text>
              </TouchableOpacity>
            )}
            {cleanupCost && (
              <Text style={styles.costText}>
                {cleanupCost.tokensIn}↓ {cleanupCost.tokensOut}↑ · ${cleanupCost.cost.toFixed(4)}
              </Text>
            )}
          </View>

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
    </Animated.View>
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
    justifyContent: "space-between",
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error + "20",
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  deleteText: {
    fontSize: 18,
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
  costText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
