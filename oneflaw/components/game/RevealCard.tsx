import { useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RevealContent } from "@/puzzles/types";

const SCREEN_H = Dimensions.get("window").height;

type CopyState = "idle" | "copied" | "error";

function Section({
  icon,
  label,
  body,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  body: string;
  danger?: boolean;
}) {
  return (
    <View className="mb-6 rounded-2xl bg-slate-900/70 p-4">
      <View className="mb-2 flex-row items-center gap-2">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            danger ? "bg-rose-950" : "bg-slate-800"
          }`}
        >
          <Ionicons
            name={icon}
            size={16}
            color={danger ? "#c99090" : "#91b3a4"}
          />
        </View>
        <Text
          accessibilityRole="header"
          className="flex-1 text-[13px] font-bold"
          style={{ color: danger ? "#c99090" : "#91b3a4" }}
        >
          {label}
        </Text>
      </View>
      <Text className="text-[15px] leading-6 text-slate-200">{body}</Text>
    </View>
  );
}

export function RevealCard({
  visible,
  reveal,
  onClose,
}: {
  visible: boolean;
  reveal: RevealContent;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_H);
  const backdrop = useSharedValue(0);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (!visible) {
      translateY.value = SCREEN_H;
      backdrop.value = 0;
      return;
    }

    translateY.value = withTiming(0, {
      duration: 360,
      reduceMotion: ReduceMotion.System,
    });
    backdrop.value = withTiming(1, {
      duration: 240,
      reduceMotion: ReduceMotion.System,
    });
    setCopyState("idle");
  }, [visible, translateY, backdrop]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  async function copyResult() {
    const result = [
      `OneFlaw case solved: ${reveal.vulnName}`,
      reveal.whatYouDid,
      `How to prevent it: ${reveal.howToPrevent}`,
    ].join("\n\n");

    try {
      await Clipboard.setStringAsync(result);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1800);
  }

  // Keep the solved answer completely out of the accessibility and web trees
  // until the player explicitly opens it.
  if (!visible) return null;

  return (
    <View
      accessibilityLabel={`Case solved: ${reveal.vulnName}`}
      accessibilityViewIsModal
      role="dialog"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
      }}
    >
      <Animated.View
        style={[
          backdropStyle,
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.68)",
          },
        ]}
      />
      <Animated.View
        style={[
          cardStyle,
          {
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#0b0f14",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
          },
        ]}
      >
        <View style={{ maxHeight: SCREEN_H * 0.88 }}>
          <View className="items-center pb-1 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          <View className="flex-row items-center px-5 pb-1 pt-2">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-800">
              <Ionicons name="shield-checkmark" size={21} color="#91b3a4" />
            </View>
            <View className="flex-1">
              <Text
                className="text-[12px] font-bold uppercase tracking-[1.5px]"
                style={{ color: "#91b3a4" }}
              >
                Case solved
              </Text>
              <Text className="mt-0.5 text-sm text-slate-400">
                Here is what happened behind the screen.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close case explanation"
              className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-800"
            >
              <Ionicons name="close" size={24} color="#cbd5e1" />
            </Pressable>
          </View>
          <Text
            accessibilityRole="header"
            className="px-5 pb-4 pt-3 text-2xl font-extrabold leading-8 text-white"
          >
            {reveal.vulnName}
          </Text>

          <ScrollView
            className="px-5"
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">
              <Text
                className="mb-2 text-[12px] font-bold uppercase tracking-[1.2px]"
                style={{ color: "#91b3a4" }}
              >
                In plain language
              </Text>
              <Text className="text-base font-medium leading-6 text-white">
                {reveal.whatYouDid}
              </Text>
            </View>
            <Section
              icon="construct"
              label="Why this happened"
              body={reveal.whyItExists}
            />
            <Section
              icon="warning"
              label="Why it matters"
              body={reveal.whyDangerous}
              danger
            />
            <Section
              icon="shield-checkmark"
              label="How to stop it"
              body={reveal.howToPrevent}
            />
            <Section
              icon="newspaper"
              label="Where this shows up"
              body={reveal.realIncident}
            />
          </ScrollView>

          <View
            className="flex-row gap-3 border-t border-slate-800 bg-ink px-5 pt-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Pressable
              onPress={copyResult}
              accessibilityRole="button"
              accessibilityLabel={
                copyState === "copied"
                  ? "Case result copied"
                  : copyState === "error"
                    ? "Copy failed. Try copying the case result again"
                    : "Copy case result"
              }
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-slate-700 active:bg-slate-800"
            >
              <Ionicons
                name={copyState === "copied" ? "checkmark" : "copy-outline"}
                size={18}
                color="#e2e8f0"
              />
              <Text
                accessibilityLiveRegion="polite"
                className="font-semibold text-slate-200"
              >
                {copyState === "copied"
                  ? "Result copied"
                  : copyState === "error"
                    ? "Couldn’t copy"
                    : "Copy result"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Continue exploring"
              className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#789f90] active:bg-[#648576]"
            >
              <Text className="font-bold text-ink">Continue</Text>
              <Ionicons name="arrow-forward" size={16} color="#0b0f14" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
