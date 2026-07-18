import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * The mission banner. A muted "YOUR MISSION" label, then the challenge question
 * big and bold. Hints are revealed one at a time — each a nudge toward where to
 * look, never the answer. Hint state is owned by the shell so a puzzle can
 * escalate it after a non-winning attempt.
 */
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

  return (
    <View className="border-b border-slate-800 bg-slate-950 px-5 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mb-1 text-[11px] font-bold uppercase tracking-[2px] text-accent">
            Your mission
          </Text>
          <Text className="text-xl font-extrabold leading-7 text-white">
            {question}
          </Text>
        </View>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          className="mt-5 flex-row items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 active:bg-slate-800"
        >
          <Ionicons name="bulb-outline" size={13} color="#cbd5e1" />
          <Text className="text-xs font-medium text-slate-300">
            {shown > 0 ? "Hide" : "Stuck?"}
          </Text>
        </Pressable>
      </View>

      {shown > 0 ? (
        <View className="mt-3 gap-2">
          {hints.slice(0, shown).map((h, i) => (
            <View
              key={i}
              className="flex-row items-start gap-2 rounded-xl bg-slate-800/70 p-3"
            >
              <Ionicons name="bulb" size={15} color="#eab308" />
              <Text className="flex-1 text-[13px] leading-5 text-slate-300">
                {h}
              </Text>
            </View>
          ))}
          {hasMore ? (
            <Pressable onPress={onMore} className="self-start px-1 py-1">
              <Text className="text-xs font-semibold text-accent">
                Need another hint?
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
