import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { C, CHAMPAGNE } from "./fx";

/**
 * Non-blocking success ribbon shown the instant the flaw is found — a calm,
 * green "solved" moment. It never traps the player: dismiss and keep exploring,
 * or open the full reveal.
 */
export function SuccessRibbon({
  message,
  onExplain,
  onDismiss,
}: {
  message: string;
  onExplain: () => void;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(140);
  const o = useSharedValue(0);

  useEffect(() => {
    y.value = withTiming(0, { duration: 340 });
    o.value = withTiming(1, { duration: 340 });
  }, [y, o]);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[style, { paddingBottom: insets.bottom + 12 }]}
      className="absolute bottom-0 left-0 right-0 z-10 px-4"
    >
      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: C.panel,
          borderWidth: 1,
          borderColor: "rgba(52,199,89,0.28)",
        }}
      >
        <View className="flex-row items-start gap-2.5">
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 24, height: 24, backgroundColor: "rgba(52,199,89,0.14)" }}
          >
            <Ionicons name="checkmark" size={14} color={C.good} />
          </View>
          <Text className="flex-1 text-[14px] font-semibold leading-5 text-ice">
            {message}
          </Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={18} color={C.muted} />
          </Pressable>
        </View>
        <Pressable onPress={onExplain} className="mt-3.5 active:opacity-90">
          <LinearGradient
            colors={CHAMPAGNE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: 12,
              paddingVertical: 11,
            }}
          >
            <Text className="font-bold" style={{ color: C.bg }}>
              What did I just do?
            </Text>
            <Ionicons name="arrow-forward" size={16} color={C.bg} />
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/** Compact persistent pill to re-open the reveal after dismissing the ribbon. */
export function ReopenPill({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      style={{
        bottom: insets.bottom + 16,
        backgroundColor: C.panel2,
        borderWidth: 1,
        borderColor: C.line2,
      }}
      className="absolute right-4 z-10 flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-80"
    >
      <Ionicons name="lock-open-outline" size={14} color={C.good} />
      <Text className="text-xs font-semibold text-ice">What happened?</Text>
    </Pressable>
  );
}
