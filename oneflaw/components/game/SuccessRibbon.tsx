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
  const y = useSharedValue(180);

  useEffect(() => {
    y.value = withTiming(0, {
      duration: 240,
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
      <View
        className="overflow-hidden rounded-2xl border border-slate-700"
        style={{ backgroundColor: "#11161a" }}
      >
        <View className="flex-row items-center p-3">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-slate-800">
            <Ionicons
              name="shield-checkmark"
              size={19}
              color="#91b3a4"
              accessible={false}
            />
          </View>
          <View className="min-w-0 flex-1">
            <Text
              className="text-[12px] font-bold uppercase tracking-[1.5px]"
              style={{ color: "#91b3a4" }}
            >
              Case solved
            </Text>
            <Text
              accessibilityLabel={`Case solved. ${message}`}
              accessibilityLiveRegion="assertive"
              accessibilityRole="summary"
              className="mt-0.5 text-[14px] font-semibold leading-5"
              style={{ color: "#f3efe5" }}
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
            <Ionicons
              name="close"
              size={21}
              color="#cbd5e1"
              accessible={false}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={onExplain}
          accessibilityRole="button"
          accessibilityLabel="View case explanation"
          className="h-12 flex-row items-center justify-between border-t border-slate-700 px-4 active:bg-slate-800"
        >
          <Text className="text-[14px] font-bold" style={{ color: "#91b3a4" }}>
            View explanation
          </Text>
          <Ionicons
            name="arrow-forward"
            size={17}
            color="#91b3a4"
            accessible={false}
          />
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
      accessibilityRole="button"
      accessibilityLabel="Open case explanation"
      style={{
        position: "absolute",
        right: 16,
        bottom: insets.bottom + 16,
        zIndex: 10,
        minHeight: 48,
      }}
      className="flex-row items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 active:bg-slate-800"
    >
      <Ionicons
        name="shield-checkmark"
        size={16}
        color="#91b3a4"
        accessible={false}
      />
      <Text className="text-sm font-semibold text-slate-100">
        Case explanation
      </Text>
    </Pressable>
  );
}
