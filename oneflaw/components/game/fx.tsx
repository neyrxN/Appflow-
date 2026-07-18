import { useEffect, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * Graphite — the OneFlaw visual system.
 * Premium iOS dark: neutral charcoal surfaces do the work, one warm champagne
 * accent for primary actions, green for success, coral for the reveal only.
 * Animated / gradient pieces use inline `style` so Reanimated + LinearGradient
 * stay predictable; motion is restrained and respects reduce-motion.
 */

export const C = {
  bg: "#08080A",
  void: "#08080A", // alias
  void2: "#0E0E12",
  panel: "#151517",
  panel2: "#1C1C20",
  raised: "#28282E",
  ice: "#F4F4F6",
  dim: "#9A9AA2",
  muted: "#6E6E76",
  faint: "#48484F",
  gold: "#E3C69A",
  cyan: "#5B8DEF", // soft blue whisper
  iris: "#5B8DEF",
  good: "#34C759",
  warn: "#F5B547",
  flaw: "#F2705B", // muted coral
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.12)",
} as const;

/** The single warm accent gradient — primary buttons only. */
export const CHAMPAGNE = ["#F4E8CE", "#E1C495"] as const;

/**
 * Tactile press: a gentle scale-down on press-in, spring back on release.
 * className is forwarded to the inner Pressable so NativeWind still applies.
 */
export function PressableScale({
  children,
  onPress,
  disabled,
  className,
  style,
  hitSlop,
  scaleTo = 0.975,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  scaleTo?: number;
}) {
  const s = useSharedValue(1);
  const reduce = useReducedMotion();
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Animated.View style={a}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={hitSlop}
        onPressIn={() => {
          if (!reduce) s.value = withTiming(scaleTo, { duration: 110 });
        }}
        onPressOut={() => {
          s.value = withSpring(1, { damping: 15, stiffness: 240, mass: 0.5 });
        }}
        className={className}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * The OneFlaw mark: a dark tile with a soft glass sheen and one fine seam of
 * light — the "one flaw" idea rendered as refined glass, not a neon crack.
 */
export function Seal({ size = 40 }: { size?: number }) {
  const radius = size * 0.3;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.line2,
      }}
    >
      <LinearGradient
        colors={["#20202A", "#0C0C10"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* glass sheen */}
      <LinearGradient
        colors={["rgba(255,255,255,0.14)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      {/* one fine seam */}
      <View
        style={{
          position: "absolute",
          left: size * 0.5,
          top: -size * 0.2,
          width: 1,
          height: size * 1.4,
          backgroundColor: "rgba(227,198,154,0.55)",
          transform: [{ rotate: "22deg" }],
        }}
      />
    </View>
  );
}

/** A small, calm connection dot with an optional slow breathe (no glow). */
export function LiveDot({
  color = C.good,
  size = 6,
  style,
}: {
  color?: string;
  size?: number;
  style?: ViewStyle;
}) {
  const o = useSharedValue(1);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    o.value = withRepeat(
      withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [o, reduce]);

  const a = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[
        a,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
