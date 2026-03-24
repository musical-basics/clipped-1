import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";
import { updateNoteStatus } from "../../lib/notes";
import { useAuth } from "../../lib/auth";
import type { Note } from "../../lib/types";
import { colors, fontSize, spacing, radius } from "../../lib/theme";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function VaultScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "stored")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setNotes(data as Note[]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleDelete = async (noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateNoteStatus(noteId, "archived");
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setDeleteToast("Moved to recently deleted. Will be completely deleted in 30 days.");
    setTimeout(() => setDeleteToast(null), 3000);
  };

  const filteredNotes = search.trim()
    ? notes.filter((n) =>
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  const renderItem = ({ item }: { item: Note }) => {
    const lines = item.content.split("\n");
    const title = lines[0].slice(0, 60);
    const preview = item.content.slice(0, 100);

    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => router.push(`/note/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.noteCardContent}>
          <View style={styles.noteCardLeft}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.notePreview} numberOfLines={2}>
              {preview}
            </Text>
            <Text style={styles.noteTime}>{timeAgo(item.updated_at)}</Text>
          </View>
          <TouchableOpacity
            style={styles.noteDeleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.noteDeleteText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vault</Text>
        </View>
        <Text style={styles.count}>{notes.length} notes</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>
            {search ? "No matching notes" : "No stored notes yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? "Try a different search term"
              : "Start capturing and reviewing to fill your vault!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}

      {deleteToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{deleteToast}</Text>
        </View>
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
  count: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  noteCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteCardLeft: {
    flex: 1,
  },
  noteDeleteBtn: {
    backgroundColor: colors.error + "30",
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error + "50",
  },
  noteDeleteText: {
    fontSize: 14,
    color: colors.error,
  },
  noteTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  notePreview: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noteTime: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  emptyContainer: {
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
  toast: {
    position: "absolute",
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  toastText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
  },
});
