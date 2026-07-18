import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/** A compact, persistent mission with progressively revealed hints. */
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
    <View className="border-b border-slate-800 bg-slate-950 px-4 py-3">
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1">
          <Text className="mb-0.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#789f90]">
            Mission
          </Text>
          <Text
            accessibilityRole="header"
            className="text-[17px] font-bold leading-6 text-white"
          >
            {question}
          </Text>
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={
            expanded ? `Hide ${shown} shown hints` : "Show a hint"
          }
          accessibilityHint="Hints give progressively clearer clues without revealing the answer."
          accessibilityState={{ expanded }}
          className="min-h-12 flex-row items-center justify-center gap-1.5 rounded-xl border border-slate-600 bg-slate-900 px-3 active:bg-slate-800"
        >
          <Ionicons
            name={expanded ? "chevron-up" : "bulb-outline"}
            size={16}
            color="#cbd5e1"
            accessible={false}
          />
          <Text className="text-sm font-semibold text-slate-200">
            {expanded ? "Hide" : "Hint"}
          </Text>
        </Pressable>
      </View>

      {expanded ? (
        <View
          className="mt-3 gap-2"
          accessibilityLiveRegion="polite"
        >
          {hints.slice(0, shown).map((hint, index) => (
            <View
              key={index}
              accessible
              accessibilityLabel={`Hint ${index + 1} of ${hints.length}. ${hint}`}
              className="flex-row items-start gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3"
            >
              <Ionicons
                name="bulb"
                size={16}
                color="#d7b96e"
                accessible={false}
              />
              <View className="min-w-0 flex-1">
                <Text className="mb-0.5 text-xs font-bold uppercase tracking-wide text-[#d7b96e]">
                  Hint {index + 1} of {hints.length}
                </Text>
                <Text className="text-[14px] leading-5 text-slate-200">
                  {hint}
                </Text>
              </View>
            </View>
          ))}
          {hasMore ? (
            <Pressable
              onPress={onMore}
              accessibilityRole="button"
              accessibilityLabel={`Show hint ${shown + 1} of ${hints.length}`}
              className="min-h-12 self-start justify-center rounded-xl px-3 active:bg-slate-900"
            >
              <Text className="text-sm font-bold text-[#789f90]">
                Show another hint
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
