import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { C } from "./fx";

/**
 * Transient in-world feedback (e.g. "No order found"). Neutral — never framed
 * as a failure or a used-up attempt.
 */
export function Toast({ message }: { message: string }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 180 });
    y.value = withTiming(0, { duration: 220 });
  }, [message, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={style}
      className="absolute bottom-10 left-0 right-0 items-center"
    >
      <Text
        className="overflow-hidden rounded-full px-4 py-2 text-sm font-medium text-ice"
        style={{
          backgroundColor: "rgba(15,19,28,0.95)",
          borderWidth: 1,
          borderColor: C.line2,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
