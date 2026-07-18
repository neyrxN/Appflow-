import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { puzzles } from "@/puzzles/registry";
import { getSolved } from "@/lib/storage";

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [solved, setSolved] = useState<string[]>([]);

  // Refresh the ✓ badges whenever we return to the dashboard.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSolved().then((ids) => active && setSolved(ids));
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        {/* Wordmark */}
        <View className="mb-1 flex-row items-center gap-2">
          <Ionicons name="bug" size={26} color="#22e07a" />
          <Text className="text-3xl font-extrabold tracking-tight text-white">
            One<Text className="text-accent">Flaw</Text>
          </Text>
        </View>
        <Text className="mb-8 text-[15px] leading-6 text-slate-400">
          Each site below hides exactly one security mistake. Poke around, break
          it, and learn what really went wrong.
        </Text>

        {puzzles.map((p) => {
          const isSolved = solved.includes(p.id);
          return (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/play/${p.id}`)}
              className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 active:border-slate-700 active:bg-slate-800"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">{p.emoji}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold text-white">
                      {p.title}
                    </Text>
                    {isSolved ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22e07a"
                      />
                    ) : null}
                  </View>
                  <Text className="mt-0.5 text-sm text-slate-400">
                    {p.question}
                  </Text>
                  {isSolved ? (
                    <Text className="mt-1 text-xs font-semibold text-accent">
                      Solved · {p.vulnName}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#475569" />
              </View>
            </Pressable>
          );
        })}

        <Text className="mt-6 text-center text-xs text-slate-600">
          Everything here is fictional. No real sites, people, or systems are
          involved.
        </Text>
      </ScrollView>
    </View>
  );
}
