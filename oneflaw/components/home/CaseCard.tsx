import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Puzzle } from "@/puzzles/types";
import { getCaseMeta } from "./caseMeta";

export function CaseCard({
  puzzle,
  index,
  solved,
  recommended,
  onPress,
}: {
  puzzle: Puzzle;
  index: number;
  solved: boolean;
  recommended: boolean;
  onPress: () => void;
}) {
  const meta = getCaseMeta(puzzle.id);
  const status = solved ? "Case closed" : recommended ? "Up next" : "Ready";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${status}. ${puzzle.title}. ${puzzle.question}`}
      accessibilityHint="Opens this fictional cyber case"
      className={`mb-4 min-h-12 overflow-hidden rounded-3xl border p-5 active:opacity-80 ${
        recommended && !solved
          ? "border-[#41584b] bg-slate-900"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
            Case {String(index + 1).padStart(2, "0")}
          </Text>
          <View
            className={`rounded-full px-2.5 py-1 ${
              solved
                ? "bg-[#17241f]"
                : recommended
                  ? "bg-[#1d2d26]"
                  : "bg-slate-800"
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                solved || recommended ? "text-[#9fb7aa]" : "text-slate-400"
              }`}
            >
              {status}
            </Text>
          </View>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-800">
          <Text className="text-2xl" accessibilityElementsHidden>
            {puzzle.emoji}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-extrabold text-white">{puzzle.title}</Text>
      <Text className="mt-2 text-[15px] leading-6 text-slate-300">
        {puzzle.question}
      </Text>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <MetaPill icon="book-outline" label={meta.topic} />
        <MetaPill icon="speedometer-outline" label={meta.difficulty} />
        <MetaPill icon="time-outline" label={meta.duration} />
      </View>

      <View className="mt-5 min-h-12 flex-row items-center border-t border-slate-800 pt-3">
        {solved ? (
          <View className="flex-1 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={18} color="#9fb7aa" />
            <Text className="flex-1 text-[13px] font-semibold text-slate-300">
              Learned: {puzzle.vulnName}
            </Text>
          </View>
        ) : (
          <Text className="flex-1 text-[13px] font-bold text-[#9fb7aa]">
            Open case
          </Text>
        )}
        <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-800">
          <Ionicons name="arrow-forward" size={18} color="#e2e8f0" />
        </View>
      </View>
    </Pressable>
  );
}

function MetaPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5">
      <Ionicons name={icon} size={13} color="#94a3b8" />
      <Text className="text-xs font-medium text-slate-300">{label}</Text>
    </View>
  );
}
