import { useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { RevealContent } from "@/puzzles/types";

const SCREEN_H = Dimensions.get("window").height;

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
    <View className="mb-5">
      <View className="mb-1.5 flex-row items-center gap-2">
        <Ionicons name={icon} size={14} color={danger ? "#f87171" : "#22e07a"} />
        <Text
          className={`text-xs font-bold uppercase tracking-wide ${
            danger ? "text-red-400" : "text-accent"
          }`}
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
  const translateY = useSharedValue(SCREEN_H);
  const backdrop = useSharedValue(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : SCREEN_H, { duration: 380 });
    backdrop.value = withTiming(visible ? 1 : 0, { duration: 380 });
  }, [visible, translateY, backdrop]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  async function share() {
    await Clipboard.setStringAsync(`OneFlaw 🔓 solved: ${reveal.vulnName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute inset-0"
      style={{ zIndex: 20 }}
    >
      <Animated.View
        style={backdropStyle}
        className="absolute inset-0 bg-black/60"
      />
      {/* Cap height so the six sections scroll on small phones. */}
      <Animated.View
        style={cardStyle}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-ink"
      >
        <View className="max-h-[82vh]">
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          <View className="flex-row items-center gap-2 px-6 pb-3 pt-4">
            <Ionicons name="lock-open" size={22} color="#22e07a" />
            <Text className="flex-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Vulnerability found
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </Pressable>
          </View>
          <Text className="px-6 pb-4 text-2xl font-extrabold text-white">
            {reveal.vulnName}
          </Text>

          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Section
              icon="hand-left"
              label="What you did"
              body={reveal.whatYouDid}
            />
            <Section
              icon="construct"
              label="Why it exists"
              body={reveal.whyItExists}
            />
            <Section
              icon="warning"
              label="Why it's dangerous"
              body={reveal.whyDangerous}
              danger
            />
            <Section
              icon="shield-checkmark"
              label="How developers prevent it"
              body={reveal.howToPrevent}
            />
            <Section
              icon="newspaper"
              label="This really happened"
              body={reveal.realIncident}
            />
          </ScrollView>

          <View className="flex-row gap-3 border-t border-slate-800 px-6 py-4">
            <Pressable
              onPress={share}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-slate-700 py-3.5 active:bg-slate-800"
            >
              <Ionicons
                name={copied ? "checkmark" : "share-outline"}
                size={18}
                color="#e2e8f0"
              />
              <Text className="font-semibold text-slate-200">
                {copied ? "Copied!" : "Share"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-accent py-3.5 active:bg-accent-dark"
            >
              <Text className="font-bold text-ink">Keep exploring</Text>
              <Ionicons name="arrow-forward" size={16} color="#0b0f14" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
