import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { puzzles } from "@/puzzles/registry";
import { getSolved } from "@/lib/storage";
import type { Puzzle } from "@/puzzles/types";
import { C, COOL, Glow, LiveDot, Seal } from "@/components/game/fx";

/** Cosmetic per-puzzle dashboard metadata (monogram + brand gradient + level). */
const META: Record<
  string,
  { mono: string; colors: readonly [string, string]; level: number }
> = {
  idor: { mono: "S", colors: ["#FF9A3D", "#F2560A"], level: 2 },
  otp: { mono: "N", colors: ["#31E7DE", "#7C6BFF"], level: 3 },
  price: { mono: "S", colors: ["#FB923C", "#EA580C"], level: 2 },
  coupon: { mono: "S", colors: ["#FB7185", "#7C6BFF"], level: 1 },
  admin: { mono: "F", colors: ["#C084FC", "#7C6BFF"], level: 2 },
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
    <View className="flex-1" style={{ backgroundColor: C.void }}>
      {/* Ambient top glow */}
      <Glow
        color={C.iris}
        size={320}
        opacity={0.16}
        style={{ position: "absolute", top: -140, right: -80 }}
      />
      <Glow
        color={C.cyan}
        size={240}
        opacity={0.1}
        style={{ position: "absolute", top: -100, left: -80 }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 22,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <Animated.View entering={FadeIn.duration(500)}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Seal size={42} />
              <View>
                <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-faint">
                  Field kit
                </Text>
                <Text className="text-[26px] font-extrabold tracking-tight text-ice">
                  One<Text style={{ color: C.cyan }}>Flaw</Text>
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full border border-line2 px-3 py-1.5">
              <LiveDot size={6} />
              <Text className="font-mono text-[10px] uppercase tracking-widest text-dim">
                Live
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-[15px] leading-6 text-muted">
            Every site below hides exactly{" "}
            <Text className="font-semibold text-ice">one</Text> security flaw.
            Slip inside, poke around, and expose it.
          </Text>

          {/* Segmented progress — one segment per site */}
          <View className="mt-6 flex-row items-center gap-3">
            <View className="flex-1 flex-row gap-1.5">
              {puzzles.map((p) => {
                const done = solved.includes(p.id);
                return (
                  <View
                    key={p.id}
                    className="h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ backgroundColor: done ? "transparent" : C.panel2 }}
                  >
                    {done ? (
                      <LinearGradient
                        colors={COOL}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
            <Text className="font-mono text-[11px] text-dim">
              {solvedCount}/{puzzles.length} exposed
            </Text>
          </View>
        </Animated.View>

        {/* Missions */}
        <View className="mt-7 gap-3">
          {puzzles.map((p, i) => (
            <Animated.View
              key={p.id}
              entering={FadeInDown.delay(120 + i * 70).duration(520)}
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

        <Text className="mt-8 text-center font-mono text-[10px] leading-5 tracking-wide text-faint">
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
    colors: COOL,
    level: 2,
  };

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border p-4 active:opacity-90"
      style={{
        borderColor: featured ? "rgba(124,107,255,0.35)" : C.line,
        backgroundColor: C.panel,
      }}
    >
      {featured ? (
        <LinearGradient
          colors={["rgba(124,107,255,0.14)", "transparent"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.9 }}
          style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        />
      ) : null}

      <View className="flex-row items-center gap-3">
        {/* Monogram favicon */}
        <LinearGradient
          colors={meta.colors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-[16px] font-extrabold" style={{ color: C.void }}>
            {meta.mono}
          </Text>
        </LinearGradient>

        <View className="flex-1">
          <Text
            className="text-[14.5px] font-bold tracking-tight text-ice"
            numberOfLines={1}
          >
            {puzzle.title}
          </Text>
          <Text
            className="mt-0.5 font-mono text-[10.5px] text-muted"
            numberOfLines={1}
          >
            {puzzle.initialUrl}
          </Text>
        </View>

        {solved ? (
          <View className="flex-row items-center gap-1 rounded-md border border-flaw/40 bg-flaw/10 px-2 py-1">
            <Ionicons name="lock-open" size={11} color={C.flaw} />
            <Text className="font-mono text-[9px] uppercase tracking-wider text-flaw">
              Exposed
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
                  backgroundColor: n < meta.level ? C.iris : C.faint,
                }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Footer line: class stays masked until solved */}
      <View className="mt-3 flex-row items-center justify-between">
        {solved ? (
          <Text className="font-mono text-[10.5px] tracking-wide text-dim">
            {puzzle.vulnName}
          </Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="font-mono text-[9px] uppercase tracking-wider text-faint">
              Class
            </Text>
            <Text className="font-mono text-[11px] tracking-widest text-faint">
              ▓▓▓▓▓
            </Text>
          </View>
        )}

        {featured ? (
          <LinearGradient
            colors={COOL}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text className="text-[12px] font-bold" style={{ color: C.void }}>
              Begin hunt
            </Text>
            <Ionicons name="arrow-forward" size={13} color={C.void} />
          </LinearGradient>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        )}
      </View>
    </Pressable>
  );
}
