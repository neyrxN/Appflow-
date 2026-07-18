import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/** A minimal objective; help stays out of the way until the player asks for it. */
export function GoalBanner({
  question,
  hints,
  shown,
  onToggle,
  onMore,
}: {
  question: string;
  hints: string[];
  shown: number;
  onToggle: () => void;
  onMore: () => void;
}) {
  const hasMore = shown < hints.length;
  const expanded = shown > 0;

  return (
    <View className="border-b border-[#1f2025] bg-[#08090b] px-5 pb-5 pt-6">
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <Text className="mb-3 text-[11px] font-medium uppercase tracking-[3.5px] text-zinc-500">
            Objective
          </Text>
          <Text
            accessibilityRole="header"
            className="text-[25px] font-bold leading-[31px] tracking-[-0.4px] text-zinc-50"
          >
            {question}
          </Text>
          <View className="mt-4 h-[3px] w-10 rounded-full bg-[#c9b89e]" />
        </View>

        {hints.length ? (
          <Pressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={expanded ? "Hide hints" : "Show a hint"}
            accessibilityHint="Hints give a clue without revealing the answer."
            accessibilityState={{ expanded }}
            hitSlop={4}
            className="mt-5 h-11 w-11 items-center justify-center rounded-full active:bg-[#1b1c20]"
          >
            <Ionicons
              name={expanded ? "close" : "help-circle-outline"}
              size={22}
              color="#9f9fa8"
              accessible={false}
            />
          </Pressable>
        ) : null}
      </View>

      {expanded ? (
        <View
          className="mt-4 border-t border-[#24252a] pt-3"
          accessibilityLiveRegion="polite"
        >
          {hints.slice(0, shown).map((hint, index) => (
            <View
              key={index}
              accessible
              accessibilityLabel={`Hint ${index + 1} of ${hints.length}. ${hint}`}
              className="mb-2 flex-row items-start gap-2"
            >
              <Text className="w-5 pt-px font-mono text-xs text-[#a99576]">
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text className="min-w-0 flex-1 text-[14px] leading-5 text-zinc-300">
                {hint}
              </Text>
            </View>
          ))}

          {hasMore ? (
            <Pressable
              onPress={onMore}
              accessibilityRole="button"
              accessibilityLabel={`Show hint ${shown + 1} of ${hints.length}`}
              className="min-h-11 self-start justify-center pl-7 pr-2 active:opacity-60"
            >
              <Text className="text-sm font-semibold text-[#9cafaa]">
                Another hint
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
