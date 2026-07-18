import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CaseCard } from "@/components/home/CaseCard";
import { Entrance } from "@/components/home/Entrance";
import { HowToPlayModal } from "@/components/home/HowToPlayModal";
import { ProgressBar } from "@/components/home/ProgressBar";
import { RecommendedCase } from "@/components/home/RecommendedCase";
import { puzzles } from "@/puzzles/registry";
import {
  getOnboardingSeen,
  getSolved,
  markOnboardingSeen,
} from "@/lib/storage";

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [solved, setSolved] = useState<string[]>([]);
  const [howToVisible, setHowToVisible] = useState(false);
  const [firstRun, setFirstRun] = useState(false);

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

  useEffect(() => {
    let active = true;
    getOnboardingSeen().then((seen) => {
      if (active && !seen) {
        setFirstRun(true);
        setHowToVisible(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const openCase = useCallback(
    (id: string) => {
      router.push({ pathname: "/play/[id]", params: { id } });
    },
    [router],
  );

  const dismissHowTo = useCallback(() => {
    setHowToVisible(false);
    setFirstRun(false);
    void markOnboardingSeen();
  }, []);

  const solvedCount = puzzles.filter((p) => solved.includes(p.id)).length;
  const totalCases = puzzles.length;
  const allComplete = totalCases > 0 && solvedCount === totalCases;
  const recommended = puzzles.find((p) => !solved.includes(p.id)) ?? puzzles[0];
  const progressPercent =
    totalCases === 0 ? 0 : (solvedCount / totalCases) * 100;

  return (
    <View className="flex-1 bg-slate-950">
      <View
        accessibilityElementsHidden
        style={{ pointerEvents: "none" }}
        className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-[#15211c]"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
      >
        <Entrance>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#9fb7aa]">
                <Ionicons name="bug" size={25} color="#0b0f14" />
              </View>
              <View>
                <Text className="text-xl font-extrabold tracking-tight text-white">
                  One<Text className="text-[#9fb7aa]">Flaw</Text>
                </Text>
                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
                  Cyber cases
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setFirstRun(false);
                setHowToVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="How to play"
              accessibilityHint="Opens a short explanation of the game"
              className="min-h-12 flex-row items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 active:bg-slate-800"
            >
              <Ionicons name="help-circle-outline" size={18} color="#cbd5e1" />
              <Text className="text-sm font-bold text-slate-200">
                How to play
              </Text>
            </Pressable>
          </View>
        </Entrance>

        <Entrance delay={70}>
          <View className="pb-7 pt-10">
            <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#9fb7aa]">
              Play · break · learn
            </Text>
            <Text
              accessibilityRole="header"
              className="mt-3 max-w-[330px] text-4xl font-extrabold leading-[44px] tracking-tight text-white"
            >
              Can you spot the one flaw?
            </Text>
            <Text className="mt-4 max-w-[350px] text-[16px] leading-6 text-slate-300">
              Explore five fictional apps, make curious choices, and uncover the
              security mistake each one should have caught.
            </Text>
            <View className="mt-5 flex-row flex-wrap gap-2">
              <HeroPill icon="flash-outline" label="Short cases" />
              <HeroPill icon="heart-outline" label="No lives or timers" />
              <HeroPill icon="bulb-outline" label="Hints included" />
            </View>
          </View>
        </Entrance>

        <Entrance delay={140}>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Case progress"
            accessibilityValue={{ min: 0, max: totalCases, now: solvedCount }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-5"
          >
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
                  Your progress
                </Text>
                <Text className="mt-1 text-2xl font-extrabold text-white">
                  {solvedCount} / {totalCases}
                  <Text className="text-sm font-semibold text-slate-400">
                    {" "}
                    cases closed
                  </Text>
                </Text>
              </View>
              <Text className="font-mono text-sm font-bold text-[#9fb7aa]">
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <ProgressBar progress={progressPercent} />
            </View>
            <Text className="mt-3 text-[13px] leading-5 text-slate-400">
              {allComplete
                ? "Every flaw found. Replay any case whenever you want."
                : `${totalCases - solvedCount} ${totalCases - solvedCount === 1 ? "case" : "cases"} still waiting for your investigation.`}
            </Text>
          </View>
        </Entrance>

        {recommended ? (
          <Entrance delay={210}>
            <View className="mt-7">
              <RecommendedCase
                puzzle={recommended}
                allComplete={allComplete}
                onPress={() => openCase(recommended.id)}
              />
            </View>
          </Entrance>
        ) : null}

        <View className="mb-4 mt-9 flex-row items-end justify-between">
          <View>
            <Text
              accessibilityRole="header"
              className="text-2xl font-extrabold text-white"
            >
              All cases
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              Pick any story. There is no required order.
            </Text>
          </View>
          <Text className="font-mono text-xs font-bold text-slate-400">
            {totalCases} TOTAL
          </Text>
        </View>

        {puzzles.map((p, index) => (
          <CaseCard
            key={p.id}
            puzzle={p}
            index={index}
            solved={solved.includes(p.id)}
            recommended={!allComplete && recommended?.id === p.id}
            onPress={() => openCase(p.id)}
          />
        ))}

        <View className="mt-4 flex-row items-start gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-800">
            <Ionicons name="shield-checkmark" size={22} color="#9fb7aa" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-white">
              A safe, fictional sandbox
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-slate-300">
              Every site, person and account in OneFlaw is made up. The cases
              run on your device and never connect to a real system.
            </Text>
          </View>
        </View>
      </ScrollView>

      <HowToPlayModal
        visible={howToVisible}
        firstRun={firstRun}
        onDismiss={dismissHowTo}
      />
    </View>
  );
}

function HeroPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-2">
      <Ionicons name={icon} size={14} color="#9fb7aa" />
      <Text className="text-xs font-semibold text-slate-300">{label}</Text>
    </View>
  );
}
