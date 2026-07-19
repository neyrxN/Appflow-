import { useEffect } from "react";
import { AccessibilityInfo, Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Transient, neutral feedback. GameShell unmounts it after its display time. */
export function Toast({ message }: { message: string }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: reduceMotion ? 0 : 140 });
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        pointerEvents: "none",
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        zIndex: 35,
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={{
            maxWidth: 520,
            borderWidth: 1,
            borderColor: "#475569",
            borderRadius: 14,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text className="text-center text-[14px] font-semibold leading-5 text-slate-100">
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
