import { useCallback } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GameShell } from "@/components/game/GameShell";
import { getPuzzle } from "@/puzzles/registry";
import { markSolved } from "@/lib/storage";

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const puzzle = getPuzzle(id);

  const goHome = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  const onSolved = useCallback(() => {
    if (puzzle) markSolved(puzzle.id);
  }, [puzzle]);

  if (!puzzle) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 p-6">
        <Text className="text-slate-300">Puzzle not found.</Text>
      </View>
    );
  }

  return <GameShell puzzle={puzzle} onBack={goHome} onSolved={onSolved} />;
}
