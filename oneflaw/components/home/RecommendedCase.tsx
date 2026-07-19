import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Puzzle } from "@/puzzles/types";
import { getCaseMeta } from "./caseMeta";

export function RecommendedCase({
  puzzle,
  allComplete,
  onPress,
}: {
  puzzle: Puzzle;
  allComplete: boolean;
  onPress: () => void;
}) {
  const meta = getCaseMeta(puzzle.id);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${allComplete ? "Replay a case" : "Recommended next case"}: ${puzzle.title}. ${puzzle.question}`}
      accessibilityHint="Opens this fictional cyber case"
      className="min-h-12 overflow-hidden rounded-3xl border border-[#41584b] bg-[#14221c] p-5 active:opacity-80"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={allComplete ? "trophy-outline" : "sparkles"}
          size={16}
          color="#9fb7aa"
        />
        <Text className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#9fb7aa]">
          {allComplete ? "Replay a favourite" : "Recommended next"}
        </Text>
      </View>

      <View className="mt-4 flex-row items-start gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
          <Text className="text-3xl" accessibilityElementsHidden>
            {puzzle.emoji}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-white">
            {puzzle.title}
          </Text>
          <Text className="mt-1 text-[14px] leading-5 text-slate-300">
            {puzzle.question}
          </Text>
        </View>
      </View>

      <View className="mt-5 min-h-12 flex-row items-center border-t border-[#2b4136] pt-3">
        <Text className="flex-1 text-xs font-semibold text-slate-300">
          {meta.topic} · {meta.difficulty} · {meta.duration}
        </Text>
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#9fb7aa]">
          <Ionicons name="arrow-forward" size={18} color="#0b0f14" />
        </View>
      </View>
    </Pressable>
  );
}
