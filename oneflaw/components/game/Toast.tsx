import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Transient in-world feedback (e.g. "No order found"). Neutral — never framed
 * as a failure or a used-up attempt.
 */
export function Toast({ message }: { message: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 160 });
  }, [message, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={style}
      className="absolute bottom-10 left-0 right-0 items-center"
    >
      <Text className="overflow-hidden rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100">
        {message}
      </Text>
    </Animated.View>
  );
}
