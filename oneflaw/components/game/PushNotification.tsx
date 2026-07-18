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

import type { NotificationConfig } from "@/puzzles/types";
import { C, CHAMPAGNE } from "./fx";

/**
 * A phone-style push banner that slides in from the top. The shell controls how
 * long it stays; the bell in the chrome can re-open the last one, so a code
 * that arrives here never has to live in a static tip.
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
        className="flex-row items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: "rgba(20,25,38,0.96)",
          borderWidth: 1,
          borderColor: C.line2,
          shadowColor: "#000",
          shadowOpacity: 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <LinearGradient
          colors={CHAMPAGNE}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="pricetag" size={18} color={C.void} />
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-ice">{config.title}</Text>
          <Text className="text-[12px] leading-4" style={{ color: C.dim }}>
            {config.body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
