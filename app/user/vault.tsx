import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";
import { updateNoteStatus } from "../../lib/notes";
import { useAuth } from "../../lib/auth";
import { useThemeColors } from "../../lib/ThemeContext";
import type { Note } from "../../lib/types";
import { fontSize, spacing, radius } from "../../lib/theme";
import type { ThemeColors } from "../../lib/theme";

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

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - noteDay.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined });
}

const PAGE_SIZE = 25;

export default function VaultScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [hasMore, setHasMore] = useState(true);

  const loadNotes = useCallback(async (append = false) => {
    if (!user) return;
    const offset = append ? notes.length : 0;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "stored")
      .order("updated_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!error && data) {
      if (append) {
        setNotes((prev) => [...prev, ...(data as Note[])]);
      } else {
        setNotes(data as Note[]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }
  }, [user, notes.length]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes(false);
    setRefreshing(false);
  };

  const handleDelete = async (noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateNoteStatus(noteId, "archived");
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setDeleteToast("Moved to recently deleted. Will be permanently deleted after 30 days.");
    setTimeout(() => setDeleteToast(null), 3000);
  };

  const filteredNotes = search.trim()
    ? notes.filter((n) =>
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  // Group by day
  const sections = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    for (const note of filteredNotes) {
      const label = getDayLabel(note.updated_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(note);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredNotes]);

  const renderListItem = ({ item }: { item: Note }) => {
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

  const renderGridItem = ({ item }: { item: Note }) => {
    const title = item.content.split("\n")[0].slice(0, 40);
    const preview = item.content.slice(0, 80);

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => router.push(`/note/${item.id}`)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.gridCardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.gridCardPreview} numberOfLines={4}>
            {preview}
          </Text>
        </View>
        <View style={styles.gridCardFooter}>
          <Text style={styles.noteTime}>{timeAgo(item.updated_at)}</Text>
          <TouchableOpacity
            style={styles.gridDeleteBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={{ fontSize: 14 }}>🗑</Text>
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
            onPress={() => router.replace("/user")}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vault</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{notes.length} notes</Text>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
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
      ) : viewMode === "list" ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListFooterComponent={
            hasMore && !search.trim() ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => loadNotes(true)}
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {filteredNotes.map((item) => (
            <View key={item.id} style={styles.gridCardWrapper}>
              {renderGridItem({ item })}
            </View>
          ))}
        </ScrollView>
      )}

      {deleteToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{deleteToast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const GRID_GAP = 12;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
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
    count: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: "600",
    },
    viewToggle: {
      padding: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    searchInput: {
      backgroundColor: colors.bgCard,
      color: colors.textPrimary,
      borderRadius: radius.lg,
      padding: spacing.md,
      fontSize: fontSize.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
    },
    sectionHeader: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    noteCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      paddingHorizontal: spacing.lg,
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
    noteTitle: {
      color: colors.textPrimary,
      fontSize: fontSize.md,
      fontWeight: "700",
      marginBottom: spacing.xs,
    },
    notePreview: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginBottom: spacing.xs,
    },
    noteTime: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },
    noteDeleteBtn: {
      backgroundColor: colors.error + "20",
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.error + "40",
      marginLeft: spacing.sm,
    },
    noteDeleteText: {
      fontSize: 16,
    },
    // Grid layout
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: spacing.lg,
      gap: GRID_GAP,
      paddingBottom: spacing.xxl,
    },
    gridCardWrapper: {
      width: "31%",
    },
    gridCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      aspectRatio: 0.85,
      justifyContent: "space-between",
    },
    gridCardTitle: {
      color: colors.textPrimary,
      fontSize: fontSize.sm,
      fontWeight: "700",
      marginBottom: spacing.xs,
    },
    gridCardPreview: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      lineHeight: 18,
    },
    gridCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    gridDeleteBtn: {
      backgroundColor: colors.error + "20",
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.error + "40",
    },
    // Empty + Toast
    loadMoreBtn: {
      alignItems: "center",
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
    },
    loadMoreText: {
      color: colors.accent,
      fontSize: fontSize.sm,
      fontWeight: "700",
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
      top: 100,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.warning + "15",
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.warning + "40",
      alignItems: "center",
    },
    toastText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: "center",
    },
  });
