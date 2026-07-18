import { useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { RevealContent } from "@/puzzles/types";
import { C, CHAMPAGNE } from "./fx";

const SCREEN_H = Dimensions.get("window").height;

type SectionDef = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  body: string;
  danger?: boolean;
};

function Section({ icon, label, body, danger, delay }: SectionDef & { delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(440)}
      className="mb-2.5 rounded-2xl p-4"
      style={{
        borderWidth: 1,
        borderColor: danger ? "rgba(242,112,91,0.25)" : C.line,
        backgroundColor: danger ? "rgba(242,112,91,0.05)" : C.panel,
      }}
    >
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={13} color={danger ? C.flaw : C.muted} />
        <Text
          className="text-[10px] font-semibold uppercase tracking-[1.5px]"
          style={{ color: danger ? C.flaw : C.muted }}
        >
          {label}
        </Text>
      </View>
      <Text className="text-[14px] leading-6" style={{ color: C.dim }}>
        {body}
      </Text>
    </Animated.View>
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
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : SCREEN_H, { duration: 420 });
    backdrop.value = withTiming(visible ? 1 : 0, { duration: 420 });
    if (visible) setRunKey((k) => k + 1);
  }, [visible, translateY, backdrop]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  async function share() {
    await Clipboard.setStringAsync(`OneFlaw — exposed: ${reveal.vulnName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const sections: SectionDef[] = [
    { icon: "hand-left-outline", label: "What you did", body: reveal.whatYouDid },
    { icon: "construct-outline", label: "Why it exists", body: reveal.whyItExists },
    { icon: "warning-outline", label: "Why it's dangerous", body: reveal.whyDangerous, danger: true },
    { icon: "shield-checkmark-outline", label: "How developers prevent it", body: reveal.howToPrevent },
    { icon: "newspaper-outline", label: "This really happened", body: reveal.realIncident },
  ];

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute inset-0"
      style={{ zIndex: 20 }}
    >
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-black/70" />

      <Animated.View
        style={[cardStyle, { backgroundColor: C.bg, borderTopWidth: 1, borderColor: C.line2 }]}
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl"
      >
        {/* faint 'flaw found' wash — restrained */}
        <LinearGradient
          colors={["rgba(242,112,91,0.10)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200 }}
        />

        <View className="max-h-[86vh]">
          <View className="items-center pt-3">
            <View style={{ height: 5, width: 40, borderRadius: 3, backgroundColor: C.raised }} />
          </View>

          <View className="flex-row items-center gap-2 px-6 pb-2 pt-5">
            <Ionicons name="lock-open-outline" size={17} color={C.flaw} />
            <Text
              className="flex-1 text-[11px] font-semibold uppercase tracking-[2px]"
              style={{ color: C.flaw }}
            >
              Vulnerability exposed
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={C.muted} />
            </Pressable>
          </View>

          <Text className="px-6 text-[25px] font-bold leading-8 tracking-tight text-ice">
            {reveal.vulnName}
          </Text>

          {/* Severity */}
          <View className="flex-row items-center gap-2.5 px-6 pb-4 pt-3.5">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(242,112,91,0.12)" }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.flaw }} />
              <Text className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.flaw }}>
                Critical
              </Text>
            </View>
            <Text className="text-[12px]" style={{ color: C.muted }}>
              Exploitable with a browser alone
            </Text>
          </View>

          <ScrollView
            key={runKey}
            className="px-6"
            contentContainerStyle={{ paddingBottom: 8, paddingTop: 2 }}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((s, i) => (
              <Section key={s.label} {...s} delay={70 + i * 70} />
            ))}
          </ScrollView>

          <View
            className="flex-row gap-3 px-6 py-4"
            style={{ borderTopWidth: 1, borderTopColor: C.line }}
          >
            <Pressable
              onPress={share}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3.5 active:opacity-70"
              style={{ borderWidth: 1, borderColor: C.line2 }}
            >
              <Ionicons name={copied ? "checkmark" : "share-outline"} size={18} color={C.dim} />
              <Text className="font-semibold" style={{ color: C.dim }}>
                {copied ? "Copied!" : "Share"}
              </Text>
            </Pressable>
            <Pressable onPress={onClose} className="flex-1 active:opacity-90">
              <LinearGradient
                colors={CHAMPAGNE}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <Text className="font-bold" style={{ color: C.bg }}>
                  Keep exploring
                </Text>
                <Ionicons name="arrow-forward" size={16} color={C.bg} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
