import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { C, CHAMPAGNE } from "./fx";

/**
 * The mission brief. A quiet "OBJECTIVE" eyebrow, the challenge question big and
 * bold under a fine champagne underline. Hints are revealed one at a time —
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
      className="px-5 py-5"
      style={{
        backgroundColor: C.bg,
        borderBottomWidth: 1,
        borderBottomColor: C.line,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mb-2.5 font-mono text-[10px] uppercase tracking-[3px] text-muted">
            Objective
          </Text>
          <Text className="text-[20px] font-bold leading-7 tracking-tight text-ice">
            {question}
          </Text>
          <LinearGradient
            colors={CHAMPAGNE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 2, width: 40, borderRadius: 2, marginTop: 13 }}
          />
        </View>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          className="mt-3.5 flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-70"
          style={{ borderWidth: 1, borderColor: C.line2 }}
        >
          <Ionicons name="bulb-outline" size={13} color={C.dim} />
          <Text className="text-xs font-medium text-dim">
            {shown > 0 ? "Hide" : "Stuck?"}
          </Text>
        </Pressable>
      </View>

      {shown > 0 ? (
        <View className="mt-4 gap-2.5">
          {hints.slice(0, shown).map((h, i) => (
            <View
              key={i}
              className="flex-row items-start gap-2.5 rounded-2xl p-3.5"
              style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line }}
            >
              <Ionicons name="bulb-outline" size={15} color={C.warn} />
              <Text className="flex-1 text-[13px] leading-5 text-dim">{h}</Text>
            </View>
          ))}
          {hasMore ? (
            <Pressable onPress={onMore} className="self-start px-1 py-1">
              <Text className="text-xs font-semibold" style={{ color: C.gold }}>
                Need another hint?
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
