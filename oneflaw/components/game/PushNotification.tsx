import { useEffect } from "react";
import { AccessibilityInfo, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { NotificationConfig } from "@/puzzles/types";

/** A replayable training notification; the shell owns its display timer. */
export function PushNotification({
  config,
  visible,
  onDismiss,
}: {
  config: NotificationConfig | null;
  visible: boolean;
  onDismiss: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(-220);

  useEffect(() => {
    y.value = withTiming(visible ? 0 : -220, {
      duration: reduceMotion ? 0 : 240,
    });

    // Android and web consume the live region below. VoiceOver needs an
    // explicit announcement because this banner does not take focus.
    if (visible && config && Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(
        `${config.title}. ${config.body}`,
      );
    }
  }, [config, reduceMotion, visible, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  // Unmounting the dismissed banner keeps offscreen notification content out
  // of VoiceOver, TalkBack, and keyboard navigation.
  if (!config || !visible) return null;

  return (
    <View
      style={{
        pointerEvents: "box-none",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        paddingTop: 8,
        paddingHorizontal: 12,
      }}
    >
      <Animated.View style={animatedStyle}>
        {/* Static wrapper owns layout/background so NativeWind web interop is
            not required on a Reanimated component. */}
        <View
          accessibilityLiveRegion="polite"
          style={{
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: "#475569",
            borderRadius: 16,
            backgroundColor: "rgba(30, 41, 59, 0.98)",
            paddingLeft: 12,
            paddingVertical: 10,
            paddingRight: 6,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.28,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#789f90]">
            <Ionicons
              name="pricetag"
              size={18}
              color="#0b0f14"
              accessible={false}
            />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold leading-5 text-white">
              {config.title}
            </Text>
            <Text className="text-[14px] leading-5 text-slate-200">
              {config.body}
            </Text>
          </View>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            className="h-12 w-12 items-center justify-center rounded-xl active:bg-slate-700"
          >
            <Ionicons
              name="close"
              size={20}
              color="#cbd5e1"
              accessible={false}
            />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
