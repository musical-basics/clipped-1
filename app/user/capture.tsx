import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { createNote } from "../../lib/notes";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { useThemeColors } from "../../lib/ThemeContext";
import { fontSize, spacing, radius } from "../../lib/theme";
import type { ThemeColors } from "../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CaptureScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const contentRef = useRef(content);
  contentRef.current = content;

  // Recent notes
  const [recentNotes, setRecentNotes] = useState<{ id: string; content: string }[]>([]);

  const loadRecentNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .select("id, content")
      .eq("user_id", user.id)
      .in("status", ["inbox", "stored"])
      .order("created_at", { ascending: false })
      .limit(3);
    if (data) setRecentNotes(data);
  }, [user]);

  useEffect(() => {
    loadRecentNotes();
  }, [loadRecentNotes]);

  // Flying note animation state
  const [flyingText, setFlyingText] = useState<string | null>(null);
  const flyX = useRef(new Animated.Value(0)).current;
  const flyY = useRef(new Animated.Value(0)).current;
  const flyOpacity = useRef(new Animated.Value(1)).current;
  const flyScale = useRef(new Animated.Value(1)).current;

  const showFlyingNote = (text: string) => {
    setFlyingText(text.length > 40 ? text.slice(0, 40) + "…" : text);
    flyX.setValue(0);
    flyY.setValue(0);
    flyOpacity.setValue(1);
    flyScale.setValue(1);

    Animated.parallel([
      Animated.timing(flyX, {
        toValue: SCREEN_WIDTH + 50,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(flyY, {
        toValue: -30,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(flyScale, {
        toValue: 0.3,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(flyOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setFlyingText(null));
  };

  const showSuccess = () => {
    Animated.sequence([
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(checkmarkOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      await createNote(user.id, trimmed);
      showFlyingNote(trimmed);
      setContent("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess();
      inputRef.current?.focus();
      loadRecentNotes();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Cmd+Enter / Ctrl+Enter to save (web)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const trimmed = contentRef.current.trim();
        if (!trimmed || !user) return;
        setSaving(true);
        try {
          await createNote(user.id, trimmed);
          showFlyingNote(trimmed);
          setContent("");
          contentRef.current = "";
          showSuccess();
          inputRef.current?.focus();
        } catch (err) {
          console.error("Save error:", err);
        } finally {
          setSaving(false);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/user")}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Capture</Text>
          <Text style={styles.subtitle}>What's on your mind?</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type your thought..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            textAlignVertical="top"
            scrollEnabled
          />
          {content.length > 0 && (
            <Text style={styles.charCount}>{content.length}</Text>
          )}
        </View>

        <View style={styles.bottomBar}>
          <Animated.View
            style={[styles.successBadge, { opacity: checkmarkOpacity }]}
          >
            <Text style={styles.successText}>✓ Saved to Inbox</Text>
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!content.trim() || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!content.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        {recentNotes.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentLabel}>Recent</Text>
            <View style={styles.recentRow}>
              {recentNotes.map((n) => (
                <View key={n.id} style={styles.recentNoteCard}>
                  <Text style={styles.recentNote} numberOfLines={2}>
                    {n.content.slice(0, 30)}{n.content.length > 30 ? "…" : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Flying note animation */}
      {flyingText && (
        <Animated.View
          style={[
            styles.flyingNote,
            {
              opacity: flyOpacity,
              transform: [
                { translateX: flyX },
                { translateY: flyY },
                { scale: flyScale },
              ],
            },
          ]}
        >
          <Text style={styles.flyingNoteText} numberOfLines={1}>
            {flyingText}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    keyboardView: {
      flex: 1,
      padding: spacing.lg,
    },
    header: {
      marginBottom: spacing.lg,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
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
    subtitle: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginTop: spacing.xs,
    },
    inputContainer: {
      flex: 1,
      position: "relative",
    },
    textInput: {
      flex: 1,
      minHeight: 200,
      color: colors.textPrimary,
      fontSize: fontSize.lg,
      lineHeight: 28,
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      paddingTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      textAlignVertical: "top",
    },
    charCount: {
      position: "absolute",
      bottom: spacing.sm,
      right: spacing.md,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing.md,
    },
    successBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
    },
    successText: {
      color: colors.success,
      fontSize: fontSize.sm,
      fontWeight: "600",
    },
    saveButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      minWidth: 100,
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    saveButtonText: {
      color: colors.textPrimary,
      fontSize: fontSize.md,
      fontWeight: "700",
    },
    flyingNote: {
      position: "absolute",
      top: "45%",
      left: spacing.lg,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.accent + "60",
      maxWidth: 200,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    flyingNoteText: {
      color: colors.textPrimary,
      fontSize: fontSize.sm,
    },
    recentSection: {
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    recentLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    recentRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    recentNote: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    recentNoteCard: {
      flex: 1,
      backgroundColor: colors.bgElevated ?? colors.bgCard,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1.5,
      borderColor: colors.accent + "30",
    },
  });
