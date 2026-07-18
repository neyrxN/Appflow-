import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Non-blocking success ribbon shown the instant the flaw fires. It sits at the
 * bottom and does NOT trap the player — they can dismiss it and keep exploring,
 * or open the full explanation.
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
    y.value = withTiming(0, { duration: 300 });
  }, [y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[style, { paddingBottom: insets.bottom + 12 }]}
      className="absolute bottom-0 left-0 right-0 z-10 px-4"
    >
      <View className="rounded-2xl border border-accent/40 bg-slate-900 p-4 shadow-lg">
        <View className="flex-row items-start gap-2">
          <Ionicons name="lock-open" size={18} color="#22e07a" />
          <Text className="flex-1 text-[14px] font-semibold leading-5 text-slate-100">
            {message}
          </Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={18} color="#64748b" />
          </Pressable>
        </View>
        <Pressable
          onPress={onExplain}
          className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 active:bg-accent-dark"
        >
          <Text className="font-bold text-ink">What did I just do?</Text>
          <Ionicons name="arrow-forward" size={16} color="#0b0f14" />
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
      style={{ bottom: insets.bottom + 16 }}
      className="absolute right-4 z-10 flex-row items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2.5 active:bg-slate-700"
    >
      <Ionicons name="lock-open" size={14} color="#22e07a" />
      <Text className="text-xs font-semibold text-slate-100">What happened?</Text>
    </Pressable>
  );
}
