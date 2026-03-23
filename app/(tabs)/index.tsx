import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { colors, fontSize, spacing, radius } from "../../lib/theme";

export default function CaptureScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;

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
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        content: trimmed,
        status: "inbox",
      });

      if (error) throw error;

      setContent("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess();
      inputRef.current?.focus();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
