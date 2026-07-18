import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { C, COOL } from "./fx";

/**
 * The mission brief. A mono "OBJECTIVE" eyebrow, the challenge question big and
 * bold under a signal-gradient underline. Hints are revealed one at a time —
 * each a nudge toward WHERE to look, never the answer.
 */
export function GoalBanner({
  question,
  hints,
  shown,
  onToggle,
  onMore,
}: {
  question: string;
  hints: string[];
  shown: number;
  onToggle: () => void;
  onMore: () => void;
}) {
  const hasMore = shown < hints.length;

  return (
    <View
      className="px-5 py-4"
      style={{
        backgroundColor: C.void,
        borderBottomWidth: 1,
        borderBottomColor: C.line,
      }}
    >
      <LinearGradient
        colors={["rgba(124,107,255,0.10)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90 }}
      />

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mb-2 font-mono text-[10px] uppercase tracking-[2px] text-iris">
            Objective
          </Text>
          <Text className="text-xl font-extrabold leading-7 text-ice">
            {question}
          </Text>
          <LinearGradient
            colors={COOL}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 2, width: 46, borderRadius: 2, marginTop: 11 }}
          />
        </View>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          className="mt-4 flex-row items-center gap-1 rounded-full px-3 py-1.5 active:opacity-70"
          style={{ borderWidth: 1, borderColor: C.line2 }}
        >
          <Ionicons name="bulb-outline" size={13} color={C.dim} />
          <Text className="text-xs font-medium text-dim">
            {shown > 0 ? "Hide" : "Stuck?"}
          </Text>
        </Pressable>
      </View>

      {shown > 0 ? (
        <View className="mt-3 gap-2">
          {hints.slice(0, shown).map((h, i) => (
            <View
              key={i}
              className="flex-row items-start gap-2 rounded-xl p-3"
              style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line }}
            >
              <Ionicons name="bulb" size={15} color={C.warn} />
              <Text className="flex-1 text-[13px] leading-5 text-dim">{h}</Text>
            </View>
          ))}
          {hasMore ? (
            <Pressable onPress={onMore} className="self-start px-1 py-1">
              <Text className="text-xs font-semibold text-cyan">
                Need another hint?
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
