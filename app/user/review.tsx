import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import SwipeCard from "../../components/SwipeCard";
import MergeSheet from "../../components/MergeSheet";
import { supabase } from "../../lib/supabase";
import { updateNoteStatus, findSimilarNotes, mergeNotes } from "../../lib/notes";
import { useAuth } from "../../lib/auth";
import type { Note, MatchResult } from "../../lib/types";
import { useThemeColors } from "../../lib/ThemeContext";
import { fontSize, spacing, radius } from "../../lib/theme";
import type { ThemeColors } from "../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_COLS = 3;
const GRID_GAP = spacing.sm;
const GRID_CARD_WIDTH =
  (SCREEN_WIDTH - spacing.lg * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

type ViewMode = "card" | "grid";

export default function ReviewScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Merge state
  const [mergeNote, setMergeNote] = useState<Note | null>(null);
  const [mergeMatches, setMergeMatches] = useState<MatchResult[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<NodeJS.Timeout>();

  const showToast = (message: string) => {
    setToast(message);
    toastOpacity.setValue(0);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 1500);
  };

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

  // Auto-refresh when tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadInboxNotes();
    }, [loadInboxNotes])
  );

  // Track current note in a ref for wheel handler
  const remainingNotes = notes.slice(currentIndex);
  const currentNoteRef = useRef<Note | null>(null);
  currentNoteRef.current = remainingNotes[0] || null;

  // Mouse wheel gestures (web, card mode only)
  const wheelProcessing = useRef(false);
  useEffect(() => {
    if (Platform.OS !== "web" || viewMode !== "card") return;
    const handleWheel = (e: WheelEvent) => {
      if (wheelProcessing.current || !currentNoteRef.current) return;
      const THRESHOLD = 50;
      const note = currentNoteRef.current;

      if (e.deltaY < -THRESHOLD) {
        e.preventDefault();
        wheelProcessing.current = true;
        handleSwipeUp(note);
        setTimeout(() => {
          wheelProcessing.current = false;
        }, 800);
      } else if (e.deltaX > THRESHOLD) {
        e.preventDefault();
        wheelProcessing.current = true;
        handleSwipeRight(note);
        setTimeout(() => {
          wheelProcessing.current = false;
        }, 800);
      } else if (e.deltaX < -THRESHOLD) {
        e.preventDefault();
        wheelProcessing.current = true;
        handleSwipeLeft(note);
        setTimeout(() => {
          wheelProcessing.current = false;
        }, 800);
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, [notes, currentIndex, viewMode]);

  // Keyboard shortcuts for card + grid mode (web)
  const keyProcessing = useRef(false);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyProcessing.current) return;
      // Don't trigger if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // In card mode, use current card; in grid mode, use first note
      const note = viewMode === "card" ? currentNoteRef.current : notes[0];
      if (!note) return;

      if (e.key === "Enter") {
        e.preventDefault();
        keyProcessing.current = true;
        handleSwipeRight(note);
        setTimeout(() => { keyProcessing.current = false; }, 600);
      } else if (e.key === " ") {
        e.preventDefault();
        keyProcessing.current = true;
        handleSwipeUp(note);
        setTimeout(() => { keyProcessing.current = false; }, 600);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        keyProcessing.current = true;
        handleSwipeLeft(note);
        setTimeout(() => { keyProcessing.current = false; }, 600);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [notes, currentIndex, viewMode]);

  const advanceCard = () => {
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 350);
  };

  const removeFromGrid = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Action animation state
  const [actionAnim, setActionAnim] = useState<{ text: string; type: "delete" | "keep" } | null>(null);
  const actionX = useRef(new Animated.Value(0)).current;
  const actionY = useRef(new Animated.Value(0)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const actionScale = useRef(new Animated.Value(1)).current;

  const playActionAnim = (text: string, type: "delete" | "keep", onDone: () => void) => {
    const preview = text.length > 30 ? text.slice(0, 30) + "…" : text;
    setActionAnim({ text: preview, type });
    actionX.setValue(0);
    actionY.setValue(0);
    actionOpacity.setValue(1);
    actionScale.setValue(1);

    if (type === "delete") {
      // Shrink and fly to bottom-left (trashcan)
      Animated.parallel([
        Animated.timing(actionX, { toValue: -SCREEN_WIDTH * 0.35, duration: 450, useNativeDriver: true }),
        Animated.timing(actionY, { toValue: 200, duration: 450, useNativeDriver: true }),
        Animated.timing(actionScale, { toValue: 0.15, duration: 450, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(250),
          Animated.timing(actionOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => setActionAnim(null));
    } else {
      // Fly right off screen (toward vault)
      Animated.parallel([
        Animated.timing(actionX, { toValue: SCREEN_WIDTH + 50, duration: 500, useNativeDriver: true }),
        Animated.timing(actionY, { toValue: -20, duration: 500, useNativeDriver: true }),
        Animated.timing(actionScale, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(actionOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => setActionAnim(null));
    }

    // Don't wait for anim to finish before advancing
    setTimeout(onDone, 100);
  };

  const handleSwipeLeft = async (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateNoteStatus(note.id, "archived");
      showToast("🗑 Deleted");
    } catch (err) {
      console.error("Archive error:", err);
    }
    if (viewMode === "card") {
      playActionAnim(note.content, "delete", advanceCard);
    } else {
      removeFromGrid(note.id);
    }
  };

  const handleSwipeRight = async (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateNoteStatus(note.id, "stored");
      showToast("✅ Kept");
    } catch (err) {
      console.error("Store error:", err);
    }
    if (viewMode === "card") {
      playActionAnim(note.content, "keep", advanceCard);
    } else {
      removeFromGrid(note.id);
    }
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
      showToast("🔗 Merged");
    } catch (err) {
      console.error("Merge error:", err);
    }

    const mergedId = mergeNote.id;
    setMergeNote(null);
    setMergeMatches([]);
    viewMode === "card" ? advanceCard() : removeFromGrid(mergedId);
  };

  const handleMergeClose = () => {
    const noteToStore = mergeNote;
    setMergeNote(null);
    setMergeMatches([]);
    if (noteToStore && viewMode === "card") {
      updateNoteStatus(noteToStore.id, "stored").catch(console.error);
      advanceCard();
    }
  };

  // ---------- Render ----------

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
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/user")}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Review</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.counter}>
            {viewMode === "card"
              ? `${currentIndex + 1} / ${notes.length}`
              : `${remainingNotes.length} notes`}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setViewMode(viewMode === "card" ? "grid" : "card")
            }
            style={styles.viewToggle}
          >
            <Ionicons
              name={viewMode === "card" ? "grid-outline" : "layers-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "card" ? (
        <>
          <View style={styles.hints}>
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => currentNote && handleSwipeLeft(currentNote)}
              activeOpacity={0.6}
            >
              <Text style={[styles.hint, { color: colors.swipeDelete }]}>
            ← Delete{"\n"}
            <Text style={styles.shortcutHint}>[⌫]</Text>
          </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => currentNote && handleSwipeUp(currentNote)}
              activeOpacity={0.6}
            >
              <Text style={[styles.hint, { color: colors.swipeMerge }]}>
            ↑ Merge{"\n"}
            <Text style={styles.shortcutHint}>[space]</Text>
          </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => currentNote && handleSwipeRight(currentNote)}
              activeOpacity={0.6}
            >
              <Text style={[styles.hint, { color: colors.swipeKeep }]}>
            Keep →{"\n"}
            <Text style={styles.shortcutHint}>[enter]</Text>
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
        </>
      ) : (
        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.gridContent}
        >
          {remainingNotes.map((note) => (
            <View key={note.id} style={styles.gridCard}>
              <Text style={styles.gridCardText} numberOfLines={5}>
                {note.content}
              </Text>
              <View style={styles.gridActions}>
                <TouchableOpacity
                  style={[
                    styles.gridActionBtn,
                    { backgroundColor: colors.swipeDelete + "20" },
                  ]}
                  onPress={() => handleSwipeLeft(note)}
                >
                  <Text
                    style={[
                      styles.gridActionText,
                      { color: colors.swipeDelete },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gridActionBtn,
                    { backgroundColor: colors.swipeMerge + "20" },
                  ]}
                  onPress={() => handleSwipeUp(note)}
                >
                  <Text
                    style={[
                      styles.gridActionText,
                      { color: colors.swipeMerge },
                    ]}
                  >
                    ↑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gridActionBtn,
                    { backgroundColor: colors.swipeKeep + "20" },
                  ]}
                  onPress={() => handleSwipeRight(note)}
                >
                  <Text
                    style={[
                      styles.gridActionText,
                      { color: colors.swipeKeep },
                    ]}
                  >
                    ✓
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* Action animation (delete / keep) */}
      {actionAnim && (
        <Animated.View
          style={[
            styles.actionAnim,
            {
              opacity: actionOpacity,
              transform: [
                { translateX: actionX },
                { translateY: actionY },
                { scale: actionScale },
              ],
            },
          ]}
        >
          <Text style={styles.actionAnimIcon}>
            {actionAnim.type === "delete" ? "🗑" : "📦"}
          </Text>
          <Text style={styles.actionAnimText} numberOfLines={1}>
            {actionAnim.text}
          </Text>
        </Animated.View>
      )}

      {/* Toast */}
      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}

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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
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
  viewToggle: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
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
    textAlign: "center",
  },
  shortcutHint: {
    fontSize: fontSize.xs,
    opacity: 0.5,
    fontWeight: "400",
  },
  hintButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  // Grid layout
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.lg,
    gap: GRID_GAP,
  },
  gridCard: {
    width: "31%",
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    aspectRatio: 0.9,
    justifyContent: "space-between",
  },
  gridCardText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  gridActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  gridActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  gridActionText: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  // Action animation
  actionAnim: {
    position: "absolute",
    top: "40%",
    left: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionAnimIcon: {
    fontSize: 20,
  },
  actionAnimText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    flex: 1,
  },
  // Empty state
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
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toastText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
