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

import { C, HOT } from "./fx";

/**
 * Non-blocking success ribbon shown the instant the flaw fires. It leans HOT —
 * the interface warming up is the signal that something just broke. It never
 * traps the player: dismiss and keep exploring, or open the full reveal.
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
  const y = useSharedValue(120);

  useEffect(() => {
    y.value = withTiming(0, { duration: 320 });
  }, [y]);

  const style = useAnimatedStyle(() => ({
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
          borderColor: "rgba(255,53,82,0.4)",
          shadowColor: C.flaw,
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <View className="flex-row items-start gap-2">
          <Ionicons name="lock-open" size={18} color={C.flaw} />
          <Text className="flex-1 text-[14px] font-semibold leading-5 text-ice">
            {message}
          </Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={18} color={C.muted} />
          </Pressable>
        </View>
        <Pressable onPress={onExplain} className="mt-3 active:opacity-90">
          <LinearGradient
            colors={HOT}
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
            <Text className="font-bold" style={{ color: C.void }}>
              What did I just do?
            </Text>
            <Ionicons name="arrow-forward" size={16} color={C.void} />
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
        borderColor: "rgba(255,53,82,0.35)",
      }}
      className="absolute right-4 z-10 flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-80"
    >
      <Ionicons name="lock-open" size={14} color={C.flaw} />
      <Text className="text-xs font-semibold text-ice">What happened?</Text>
    </Pressable>
  );
}
