import { PropsWithChildren, useEffect } from "react";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export function Entrance({
  children,
  delay = 0,
}: PropsWithChildren<{ delay?: number }>) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(10);

  useEffect(() => {
    const timing = {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    };
    opacity.value = withDelay(
      delay,
      withTiming(1, timing),
      ReduceMotion.System,
    );
    offset.value = withDelay(
      delay,
      withTiming(0, timing),
      ReduceMotion.System,
    );
  }, [delay, offset, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
