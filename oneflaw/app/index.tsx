import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CaseCard } from "@/components/home/CaseCard";
import { Entrance } from "@/components/home/Entrance";
import { HowToPlayModal } from "@/components/home/HowToPlayModal";
import { ProgressBar } from "@/components/home/ProgressBar";
import { getSolved } from "@/lib/storage";
import { puzzles } from "@/puzzles/registry";

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [solved, setSolved] = useState<string[]>([]);
  const [howToVisible, setHowToVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSolved().then((ids) => active && setSolved(ids));
      return () => {
        active = false;
      };
    }, []),
  );

  const openCase = useCallback(
    (id: string) => {
      router.push({ pathname: "/play/[id]", params: { id } });
    },
    [router],
  );

  const solvedCount = puzzles.filter((puzzle) =>
    solved.includes(puzzle.id),
  ).length;
  const progress = puzzles.length === 0 ? 0 : (solvedCount / puzzles.length) * 100;
  const rows = Array.from(
    { length: Math.ceil(puzzles.length / 2) },
    (_, index) => puzzles.slice(index * 2, index * 2 + 2),
  );

  return (
    <View className="flex-1 bg-[#0b0e12]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 20,
        }}
      >
        <Entrance>
          <View className="min-h-12 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#9fb7aa]">
                <Ionicons name="bug" size={22} color="#0b0e12" />
              </View>
              <Text className="text-xl font-extrabold tracking-tight text-[#f4f1e9]">
                One<Text className="text-[#9fb7aa]">Flaw</Text>
              </Text>
            </View>

            <Pressable
              onPress={() => setHowToVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="How to play"
              accessibilityHint="Opens a short game guide"
              hitSlop={4}
              className="h-12 w-12 items-center justify-center rounded-full active:bg-[#191e24]"
            >
              <Ionicons
                name="information-circle-outline"
                size={25}
                color="#a7adb5"
              />
            </Pressable>
          </View>
        </Entrance>

        <Entrance delay={55}>
          <View className="mb-6 mt-8">
            <View className="flex-row items-end justify-between">
              <View className="flex-1 pr-4">
                <Text
                  accessibilityRole="header"
                  className="text-[28px] font-extrabold leading-8 tracking-tight text-[#f4f1e9]"
                >
                  Choose a case
                </Text>
                <Text className="mt-1 text-sm text-[#8d949d]">
                  Find the flaw. Every level is open.
                </Text>
              </View>
              <Text
                accessibilityLabel={`${solvedCount} of ${puzzles.length} cases solved`}
                className="pb-0.5 font-mono text-sm font-bold text-[#9fb7aa]"
              >
                {solvedCount}/{puzzles.length}
              </Text>
            </View>

            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Cases solved"
              accessibilityValue={{
                min: 0,
                max: puzzles.length,
                now: solvedCount,
              }}
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#20252b]"
            >
              <ProgressBar progress={progress} />
            </View>
          </View>
        </Entrance>

        <View accessibilityLabel="Available cases">
          {rows.map((row, rowIndex) => (
            <Entrance key={row[0].id} delay={100 + rowIndex * 55}>
              <View className="mb-3 flex-row gap-3">
                {row.map((puzzle) => {
                  const index = puzzles.findIndex((item) => item.id === puzzle.id);
                  return (
                    <CaseCard
                      key={puzzle.id}
                      puzzle={puzzle}
                      index={index}
                      solved={solved.includes(puzzle.id)}
                      onPress={() => openCase(puzzle.id)}
                    />
                  );
                })}
                {row.length === 1 ? (
                  <View className="flex-1" accessibilityElementsHidden />
                ) : null}
              </View>
            </Entrance>
          ))}
        </View>
      </ScrollView>

      <HowToPlayModal
        visible={howToVisible}
        onDismiss={() => setHowToVisible(false)}
      />
    </View>
  );
}
