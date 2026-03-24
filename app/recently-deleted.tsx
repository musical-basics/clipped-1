import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { Note } from "../lib/types";
import { colors, fontSize, spacing, radius } from "../lib/theme";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RecentlyDeletedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "archived")
      .order("updated_at", { ascending: false });
    if (data) setNotes(data);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleRestore = async (noteId: string) => {
    await supabase
      .from("notes")
      .update({ status: "stored" })
      .eq("id", noteId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handlePermanentDelete = async (noteId: string) => {
    await supabase.from("notes").delete().eq("id", noteId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const renderItem = ({ item }: { item: Note }) => {
    const title = item.content.split("\n")[0].slice(0, 60);

    return (
      <View style={styles.noteCard}>
        <View style={styles.noteCardLeft}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.noteTime}>Deleted {timeAgo(item.updated_at)}</Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={() => handleRestore(item.id)}
          >
            <Text style={styles.restoreText}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permDeleteBtn}
            onPress={() => handlePermanentDelete(item.id)}
          >
            <Text style={styles.permDeleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/user/settings")}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recently Deleted</Text>
        <Text style={styles.subtitle}>
          Notes here will be permanently deleted after 30 days
        </Text>
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗑</Text>
          <Text style={styles.emptyTitle}>No deleted notes</Text>
          <Text style={styles.emptySubtitle}>
            Notes you delete will appear here for 30 days
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  noteCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  noteCardLeft: {
    flex: 1,
  },
  noteTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  noteTime: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  noteActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  restoreBtn: {
    backgroundColor: colors.accent + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent + "40",
  },
  restoreText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  permDeleteBtn: {
    backgroundColor: colors.error + "20",
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  permDeleteText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
