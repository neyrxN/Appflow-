import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  ReduceMotion,
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
  const y = useSharedValue(240);

  useEffect(() => {
    y.value = withTiming(0, {
      duration: 300,
      reduceMotion: ReduceMotion.System,
    });
  }, [y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 10,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View className="overflow-hidden rounded-3xl border border-teal-900 bg-slate-900 shadow-lg">
        <View className="h-1" style={{ backgroundColor: "#789f90" }} />
        <View className="p-4 pt-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-800">
              <Ionicons name="shield-checkmark" size={21} color="#91b3a4" />
            </View>
            <View className="flex-1">
              <Text
                className="text-[12px] font-bold uppercase tracking-[1.5px]"
                style={{ color: "#91b3a4" }}
              >
                Case solved
              </Text>
              <Text
                accessibilityLabel={`Case solved. ${message}`}
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                className="mt-1 text-[15px] font-semibold leading-5 text-slate-100"
              >
                {message}
              </Text>
            </View>
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Dismiss case solved message"
              className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-800"
            >
              <Ionicons name="close" size={22} color="#cbd5e1" />
            </Pressable>
          </View>
          <Pressable
            onPress={onExplain}
            accessibilityRole="button"
            accessibilityLabel="See what happened"
            className="mt-3 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#789f90] active:bg-[#648576]"
          >
            <Text className="text-[15px] font-bold text-ink">
              See what happened
            </Text>
            <Ionicons name="arrow-forward" size={17} color="#0b0f14" />
          </Pressable>
        </View>
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
      accessibilityRole="button"
      accessibilityLabel="Open case explanation"
      style={{
        position: "absolute",
        right: 16,
        bottom: insets.bottom + 16,
        zIndex: 10,
        minHeight: 48,
      }}
      className="flex-row items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 active:bg-slate-700"
    >
      <Ionicons name="shield-checkmark" size={16} color="#91b3a4" />
      <Text className="text-sm font-semibold text-slate-100">
        Review solved case
      </Text>
    </Pressable>
  );
}
