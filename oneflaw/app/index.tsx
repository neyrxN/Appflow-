import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { puzzles } from "@/puzzles/registry";
import { getSolved } from "@/lib/storage";
import type { Puzzle } from "@/puzzles/types";
import { C, CHAMPAGNE, LiveDot, PressableScale, Seal } from "@/components/game/fx";

/** Cosmetic per-puzzle metadata (monogram + a muted brand tint). */
const META: Record<
  string,
  { mono: string; colors: readonly [string, string] }
> = {
  idor: { mono: "S", colors: ["#C8925E", "#7E5636"] },
  otp: { mono: "N", colors: ["#5B8DEF", "#3E62B0"] },
  price: { mono: "S", colors: ["#D98A5A", "#9E5A34"] },
  coupon: { mono: "S", colors: ["#C77E86", "#7E4E63"] },
  admin: { mono: "F", colors: ["#8E86C8", "#5A5490"] },
};

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [solved, setSolved] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSolved().then((ids) => active && setSolved(ids));
      return () => {
        active = false;
      };
    }, []),
  );

  const solvedCount = puzzles.filter((p) => solved.includes(p.id)).length;
  const firstOpenIdx = puzzles.findIndex((p) => !solved.includes(p.id));

  return (
    <View className="flex-1" style={{ backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 26,
          paddingBottom: insets.bottom + 44,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <Animated.View entering={FadeIn.duration(500)}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Seal size={42} />
              <View>
                <Text className="font-mono text-[10px] uppercase tracking-[3px] text-faint">
                  Field kit
                </Text>
                <Text className="mt-1 text-[26px] font-bold tracking-tight text-ice">
                  One<Text style={{ color: C.gold }}>Flaw</Text>
                </Text>
              </View>
            </View>
            <View
              className="flex-row items-center gap-2 rounded-full px-3.5 py-2"
              style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line }}
            >
              <LiveDot size={6} color={solvedCount > 0 ? C.good : C.muted} />
              <Text className="text-[12px] font-semibold text-dim">
                {solvedCount}
                <Text style={{ color: C.faint }}> / {puzzles.length}</Text>
              </Text>
            </View>
          </View>

          <Text className="mt-6 text-[16px] leading-6 text-dim">
            Every site below hides exactly{" "}
            <Text className="font-semibold text-ice">one</Text> security flaw.
            Slip in, look around, and expose it.
          </Text>

          {/* Segmented progress — one segment per site */}
          <View className="mt-7 flex-row gap-1.5">
            {puzzles.map((p) => {
              const done = solved.includes(p.id);
              return (
                <View
                  key={p.id}
                  className="h-1 flex-1 rounded-full"
                  style={{ backgroundColor: done ? C.good : C.panel2 }}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Missions */}
        <View className="mt-8 gap-3.5">
          {puzzles.map((p, i) => (
            <Animated.View
              key={p.id}
              entering={FadeInDown.delay(80 + i * 60).duration(460)}
            >
              <MissionCard
                puzzle={p}
                solved={solved.includes(p.id)}
                featured={i === firstOpenIdx}
                onPress={() => router.push(`/play/${p.id}`)}
              />
            </Animated.View>
          ))}
        </View>

        <Text className="mt-9 text-center text-[11px] leading-5 text-faint">
          Everything here is fictional. No real sites, people, or systems are
          involved.
        </Text>
      </ScrollView>
    </View>
  );
}

function MissionCard({
  puzzle,
  solved,
  featured,
  onPress,
}: {
  puzzle: Puzzle;
  solved: boolean;
  featured: boolean;
  onPress: () => void;
}) {
  const meta = META[puzzle.id] ?? {
    mono: puzzle.title[0] ?? "?",
    colors: ["#5B8DEF", "#3E62B0"] as const,
  };

  return (
    <PressableScale
      onPress={onPress}
      className="overflow-hidden rounded-[22px] p-[18px]"
      style={{
        borderWidth: 1,
        borderColor: featured ? "rgba(227,198,154,0.22)" : C.line,
        backgroundColor: C.panel,
      }}
    >
      {featured ? (
        <LinearGradient
          colors={["rgba(227,198,154,0.08)", "transparent"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.9 }}
          style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        />
      ) : null}

      <View className="flex-row items-center gap-3.5">
        {/* Monogram favicon */}
        <LinearGradient
          colors={meta.colors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-[17px] font-bold text-white">{meta.mono}</Text>
        </LinearGradient>

        <View className="flex-1">
          <Text
            className="text-[15px] font-semibold tracking-tight text-ice"
            numberOfLines={1}
          >
            {puzzle.title}
          </Text>
          <Text
            className="mt-1 font-mono text-[11px] text-muted"
            numberOfLines={1}
          >
            {puzzle.initialUrl}
          </Text>
        </View>

        {solved ? (
          <View
            className="flex-row items-center gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: "rgba(52,199,89,0.12)" }}
          >
            <Ionicons name="checkmark-circle" size={12} color={C.good} />
            <Text
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.good }}
            >
              Solved
            </Text>
          </View>
        ) : (
          <View className="flex-row gap-1">
            {[0, 1, 2].map((n) => (
              <View
                key={n}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: C.faint,
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        {solved ? (
          <Text className="text-[12px] text-muted">{puzzle.vulnName}</Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="font-mono text-[9px] uppercase tracking-wider text-faint">
              Class
            </Text>
            <Text className="font-mono text-[11px] tracking-[3px] text-faint">
              ●●●
            </Text>
          </View>
        )}

        {featured ? (
          <LinearGradient
            colors={CHAMPAGNE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 12,
            }}
          >
            <Text className="text-[12.5px] font-bold" style={{ color: C.bg }}>
              Begin hunt
            </Text>
            <Ionicons name="arrow-forward" size={13} color={C.bg} />
          </LinearGradient>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        )}
      </View>
    </PressableScale>
  );
}
