import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Puzzle } from "@/puzzles/types";
import { getCaseMeta } from "./caseMeta";

export function CaseCard({
  puzzle,
  index,
  solved,
  onPress,
}: {
  puzzle: Puzzle;
  index: number;
  solved: boolean;
  onPress: () => void;
}) {
  const meta = getCaseMeta(puzzle.id);
  const level = index + 1;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level}, ${meta.appName}, ${meta.caseName}${solved ? ", completed" : ""}`}
      accessibilityHint="Opens this case"
      className={`min-h-[172px] flex-1 justify-between rounded-[24px] border p-4 active:opacity-75 ${
        solved
          ? "border-[#46564f] bg-[#161c1a]"
          : "border-[#242a31] bg-[#13171c]"
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            solved ? "bg-[#26332e]" : "bg-[#20252b]"
          }`}
        >
          <Text className="text-[23px]" accessibilityElementsHidden>
            {puzzle.emoji}
          </Text>
        </View>

        {solved ? (
          <View
            accessibilityElementsHidden
            className="h-7 w-7 items-center justify-center rounded-full bg-[#9fb7aa]"
          >
            <Ionicons name="checkmark" size={17} color="#0b0e12" />
          </View>
        ) : (
          <Text className="font-mono text-[11px] font-bold text-[#707780]">
            {String(level).padStart(2, "0")}
          </Text>
        )}
      </View>

      <View className="mt-5">
        <Text
          numberOfLines={1}
          className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7f8790]"
        >
          {meta.appName}
        </Text>
        <Text
          numberOfLines={2}
          className="mt-1.5 min-h-11 text-[17px] font-extrabold leading-[21px] text-[#f4f1e9]"
        >
          {meta.caseName}
        </Text>
      </View>
    </Pressable>
  );
}
