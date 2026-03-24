/**
 * Design tokens for the Clipped app.
 * Dual palette: dark-first + cream "atelier" light mode.
 */

export type ThemeColors = typeof darkColors;

export const darkColors = {
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

export const lightColors: ThemeColors = {
  // Backgrounds — warm cream "atelier" palette
  bg: "#F5F0E6",
  bgCard: "#FFFFFF",
  bgElevated: "#EDE7DA",
  bgInput: "#FEFCF8",

  // Text — warm browns
  textPrimary: "#2C2416",
  textSecondary: "#6B5E4D",
  textMuted: "#9B8E7D",

  // Accents — keep purple for brand consistency
  accent: "#6B4EE6",
  accentLight: "#8B72F0",

  // Swipe action colors
  swipeDelete: "#E5395D",
  swipeKeep: "#00B87A",
  swipeMerge: "#3D8FE0",

  // Utility
  border: "#D9D0C3",
  success: "#00B87A",
  warning: "#E5A033",
  error: "#E5395D",
};

// Static fallbacks (used by components that haven't migrated to context yet)
export const colors = darkColors;

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
