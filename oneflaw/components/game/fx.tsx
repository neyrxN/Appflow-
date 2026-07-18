import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * Obsidian Signal — shared visual system.
 * Cool (cyan → iris) is the intact system. Hot (ember → flaw) is the flaw.
 * Animated / gradient pieces use inline `style` (not className) so Reanimated
 * and LinearGradient stay predictable.
 */

export const C = {
  void: "#06070B",
  void2: "#090B12",
  panel: "#0F131C",
  panel2: "#141926",
  raised: "#1B2233",
  ice: "#EAF0FA",
  dim: "#AEB8CC",
  muted: "#7C879C",
  faint: "#545E72",
  cyan: "#31E7DE",
  iris: "#7C6BFF",
  flaw: "#FF3552",
  ember: "#FF7A45",
  good: "#33D69F",
  warn: "#F5B547",
  line: "rgba(150,170,210,0.10)",
  line2: "rgba(150,170,210,0.16)",
} as const;

export const COOL = ["#31E7DE", "#7C6BFF"] as const;
export const HOT = ["#FF7A45", "#FF3552"] as const;

/** Full-bleed obsidian ground with layered cinematic colour washes. */
export function ObsidianBg({ hot }: { hot?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.void }]} />
      <LinearGradient
        colors={["rgba(124,107,255,0.20)", "transparent"]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 0.45, y: 0.62 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(49,231,222,0.12)", "transparent"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "transparent",
          hot ? "rgba(255,53,82,0.16)" : "rgba(255,53,82,0.07)",
        ]}
        start={{ x: 0.5, y: 0.55 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** A pulsing "connection live" dot with a soft glow. */
export function LiveDot({
  color = C.cyan,
  size = 7,
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
      withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
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
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

/**
 * The OneFlaw mark: a flawless obsidian tile broken by one glowing fracture
 * (cyan → iris → flaw), with a faint branch. This is the whole idea in miniature.
 */
export function Seal({ size = 40 }: { size?: number }) {
  const radius = size * 0.28;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.line2,
        shadowColor: C.iris,
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <LinearGradient
        colors={["#141A28", "#05060A"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* main fracture */}
      <LinearGradient
        colors={["transparent", C.cyan, C.iris, C.flaw, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          left: size * 0.46,
          top: -size * 0.25,
          width: 2,
          height: size * 1.5,
          transform: [{ rotate: "24deg" }],
        }}
      />
      {/* branch */}
      <LinearGradient
        colors={[C.iris, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          left: size * 0.54,
          top: size * 0.42,
          width: 1,
          height: size * 0.34,
          transform: [{ rotate: "-38deg" }],
          opacity: 0.85,
        }}
      />
    </View>
  );
}

/** A soft radial-ish glow, faked with a shadowed circle (no blur dep needed). */
export function Glow({
  color = C.iris,
  size = 260,
  opacity = 0.5,
  style,
}: {
  color?: string;
  size?: number;
  opacity?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: size / 2.4,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

/** A downward-sweeping scan beam for the DevTools inspector. */
export function Scanline({ tint = C.cyan }: { tint?: string }) {
  const y = useSharedValue(-60);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    y.value = withRepeat(
      withTiming(760, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [y, reduce]);

  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        a,
        { position: "absolute", left: 0, right: 0, height: 60, zIndex: 1 },
      ]}
    >
      <LinearGradient
        colors={["transparent", tint + "22", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
