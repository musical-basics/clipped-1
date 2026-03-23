import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, fontSize, spacing, radius } from "../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD_X = 120;
const SWIPE_THRESHOLD_Y = -150;

interface SwipeCardProps {
  content: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  index: number; // 0 = top card, 1+ = background
}

export default function SwipeCard({
  content,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  index,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .enabled(index === 0)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Swipe Up → Merge
      if (event.translationY < SWIPE_THRESHOLD_Y) {
        translateY.value = withTiming(-600, { duration: 300 });
        runOnJS(onSwipeUp)();
        return;
      }

      // Swipe Right → Keep
      if (event.translationX > SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)();
        return;
      }

      // Swipe Left → Delete
      if (event.translationX < -SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)();
        return;
      }

      // Snap back
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15]
    );

    if (index === 0) {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
          { scale: cardScale.value },
        ],
      };
    }

    // Background cards: slightly scaled down and offset
    const scale = interpolate(index, [0, 1, 2], [1, 0.95, 0.9]);
    const offsetY = interpolate(index, [0, 1, 2], [0, 10, 20]);

    return {
      transform: [{ scale }, { translateY: offsetY }],
    };
  });

  const deleteOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, -SWIPE_THRESHOLD_X / 2, 0],
      [1, 0.3, 0]
    ),
  }));

  const keepOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X / 2, SWIPE_THRESHOLD_X],
      [0, 0.3, 1]
    ),
  }));

  const mergeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SWIPE_THRESHOLD_Y / 2, SWIPE_THRESHOLD_Y],
      [0, 0.3, 1]
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.card,
          animatedCardStyle,
          { zIndex: 10 - index },
        ]}
      >
        {/* Delete overlay */}
        <Animated.View style={[styles.overlay, styles.deleteOverlay, deleteOverlayStyle]}>
          <Text style={styles.overlayText}>DELETE</Text>
        </Animated.View>

        {/* Keep overlay */}
        <Animated.View style={[styles.overlay, styles.keepOverlay, keepOverlayStyle]}>
          <Text style={styles.overlayText}>KEEP</Text>
        </Animated.View>

        {/* Merge overlay */}
        <Animated.View style={[styles.overlay, styles.mergeOverlay, mergeOverlayStyle]}>
          <Text style={styles.overlayText}>MERGE ↑</Text>
        </Animated.View>

        {/* Content */}
        <Text style={styles.content} numberOfLines={12}>
          {content}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - spacing.lg * 2,
    minHeight: 300,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    lineHeight: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteOverlay: {
    backgroundColor: colors.swipeDelete + "30",
    borderWidth: 3,
    borderColor: colors.swipeDelete,
  },
  keepOverlay: {
    backgroundColor: colors.swipeKeep + "30",
    borderWidth: 3,
    borderColor: colors.swipeKeep,
  },
  mergeOverlay: {
    backgroundColor: colors.swipeMerge + "30",
    borderWidth: 3,
    borderColor: colors.swipeMerge,
  },
  overlayText: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: 4,
  },
});
