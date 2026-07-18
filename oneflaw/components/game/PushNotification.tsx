import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NotificationConfig } from "@/puzzles/types";

/**
 * A phone-style push banner that slides in from the top. The shell controls how
 * long it stays; the bell in the chrome can re-open the last one, so the code
 * inside it never has to live in a static tip.
 */
export function PushNotification({
  config,
  visible,
  onDismiss,
}: {
  config: NotificationConfig | null;
  visible: boolean;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(-200);

  useEffect(() => {
    y.value = withTiming(visible ? 0 : -200, { duration: 320 });
  }, [visible, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  if (!config) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[style, { paddingTop: insets.top + 8 }]}
      className="absolute left-0 right-0 top-0 z-40 px-3"
    >
      <Pressable
        onPress={onDismiss}
        className="flex-row items-center gap-3 rounded-2xl bg-slate-800/95 px-4 py-3 shadow-lg"
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <Ionicons name="pricetag" size={18} color="#0b0f14" />
        </View>
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-white">
            {config.title}
          </Text>
          <Text className="text-[12px] leading-4 text-slate-300">
            {config.body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
