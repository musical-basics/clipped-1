import { StyleSheet } from "react-native";

/**
 * Design tokens for the TriageNotes app.
 * Dark-first palette with accent colors for swipe actions.
 */
export const colors = {
  // Backgrounds
  bg: "#0A0A0F",
  bgCard: "#16161F",
  bgElevated: "#1E1E2A",
  bgInput: "#12121A",

  // Text
  textPrimary: "#F0F0F5",
  textSecondary: "#8888A0",
  textMuted: "#555570",

  // Accents
  accent: "#7C5CFC",
  accentLight: "#9B7FFF",

  // Swipe action colors
  swipeDelete: "#FF4D6A",
  swipeKeep: "#00D68F",
  swipeMerge: "#4DA6FF",

  // Utility
  border: "#2A2A3A",
  success: "#00D68F",
  warning: "#FFB84D",
  error: "#FF4D6A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
