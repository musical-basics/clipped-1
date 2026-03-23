import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { colors, fontSize, spacing, radius } from "../lib/theme";
import type { MatchResult } from "../lib/types";

interface MergeSheetProps {
  visible: boolean;
  matches: MatchResult[];
  loading: boolean;
  onSelect: (parentId: string) => void;
  onClose: () => void;
}

export default function MergeSheet({
  visible,
  matches,
  loading,
  onSelect,
  onClose,
}: MergeSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Merge with similar note</Text>
          <Text style={styles.subtitle}>
            Select a note to merge this thought into
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Finding similar notes...</Text>
            </View>
          ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No similar notes found</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Store Instead</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.matchList}>
              {matches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchCard}
                  onPress={() => onSelect(match.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.matchHeader}>
                    <View style={styles.similarityBadge}>
                      <Text style={styles.similarityText}>
                        {Math.round(match.similarity * 100)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.matchContent} numberOfLines={3}>
                    {match.content}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: colors.swipeKeep,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  closeButtonText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  matchList: {
    gap: spacing.md,
  },
  matchCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.sm,
  },
  similarityBadge: {
    backgroundColor: colors.swipeMerge + "30",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  similarityText: {
    color: colors.swipeMerge,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  matchContent: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
