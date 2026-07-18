import { useEffect, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NetworkRequest } from "@/puzzles/types";
import { C, COOL, Scanline } from "./fx";

const methodColor: Record<string, string> = {
  GET: C.cyan,
  POST: C.good,
  PUT: C.warn,
  DELETE: C.flaw,
};

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return C.good;
  if (status >= 300 && status < 400) return C.warn;
  return C.flaw;
}

/** Rough waterfall width from a "163 ms" style timing string (0–1). */
function timeFraction(time?: string): number {
  const n = time ? parseInt(time, 10) : NaN;
  if (Number.isNaN(n)) return 0.25;
  return Math.max(0.08, Math.min(1, n / 260));
}

// Real DevTools panel tabs — only Network is interactive here.
const PANEL_TABS = ["Elements", "Console", "Network", "Sources", "Performance"];

/* ---------- syntax-highlighted JSON ---------- */

function JsonNode({ value, indent }: { value: unknown; indent: number }): ReactNode {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return <Text style={{ color: C.dim }}>[]</Text>;
    return (
      <Text style={{ color: C.dim }}>
        {"[\n"}
        {value.map((v, i) => (
          <Text key={i}>
            {pad1}
            <JsonNode value={v} indent={indent + 1} />
            {i < value.length - 1 ? "," : ""}
            {"\n"}
          </Text>
        ))}
        {pad + "]"}
      </Text>
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <Text style={{ color: C.dim }}>
        {"{\n"}
        {entries.map(([k, v], i) => (
          <Text key={k}>
            {pad1}
            <Text style={{ color: "#8EA2C9" }}>{`"${k}"`}</Text>
            {": "}
            <JsonNode value={v} indent={indent + 1} />
            {i < entries.length - 1 ? "," : ""}
            {"\n"}
          </Text>
        ))}
        {pad + "}"}
      </Text>
    );
  }
  if (typeof value === "string")
    return <Text style={{ color: "#9BE7C4" }}>{`"${value}"`}</Text>;
  if (typeof value === "number" || typeof value === "boolean")
    return <Text style={{ color: C.warn }}>{String(value)}</Text>;
  return <Text style={{ color: C.muted }}>null</Text>;
}

function Json({ value }: { value: unknown }) {
  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: "#05060A",
        borderWidth: 1,
        borderColor: C.line,
        padding: 13,
      }}
    >
      <Text selectable className="font-mono text-[11.5px] leading-5">
        <JsonNode value={value} indent={0} />
      </Text>
    </View>
  );
}

type SubTab = "headers" | "payload" | "response";

function RequestDetail({ request }: { request: NetworkRequest }) {
  const insets = useSafeAreaInsets();
  const editable = request.editable;
  const [tab, setTab] = useState<SubTab>(editable ? "payload" : "response");
  const [editText, setEditText] = useState(
    editable ? JSON.stringify(editable.body, null, 2) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<unknown>(request.response ?? null);
  const [resent, setResent] = useState(false);

  const subTabs: SubTab[] = ["headers", "payload", "response"];

  function resend() {
    if (!editable) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(editText);
    } catch {
      setError("Invalid JSON — check your edits.");
      return;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      setError("The request body must be a JSON object.");
      return;
    }
    setError(null);
    Keyboard.dismiss();
    const serverResponse = editable.onResend(parsed as Record<string, unknown>);
    setResp(serverResponse);
    setResent(true);
    setTab("response");
  }

  function cancel() {
    setEditText(JSON.stringify(editable!.body, null, 2));
    setError(null);
    Keyboard.dismiss();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      className="flex-1"
    >
      {/* Request summary */}
      <View className="flex-row items-center gap-2 px-4 py-2.5">
        <Text
          className="font-mono text-[11px] font-bold"
          style={{ color: methodColor[request.method] ?? C.muted }}
        >
          {request.method}
        </Text>
        <Text
          className="flex-1 font-mono text-[12px]"
          style={{ color: C.dim }}
          numberOfLines={1}
        >
          {request.path}
        </Text>
        <Text
          className="font-mono text-[11px]"
          style={{ color: statusColor(request.status) }}
        >
          {request.status}
        </Text>
      </View>

      {/* Sub-tabs */}
      <View
        className="flex-row px-2"
        style={{ borderBottomWidth: 1, borderBottomColor: C.line }}
      >
        {subTabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className="px-3 py-2"
            style={
              tab === t
                ? { borderBottomWidth: 2, borderBottomColor: C.cyan }
                : undefined
            }
          >
            <Text
              className="text-[13px] font-semibold capitalize"
              style={{ color: tab === t ? C.cyan : C.muted }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "headers" ? (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingVertical: 14, paddingBottom: insets.bottom + 20 }}
        >
          <SubLabel>General</SubLabel>
          <View style={panelBox}>
            <HeaderLine k="Request URL" v={`https://${request.path}`} />
            <HeaderLine k="Request Method" v={request.method} />
            <HeaderLine k="Status Code" v={`${request.status}`} />
          </View>
          <View style={{ height: 16 }} />
          <SubLabel>Request Headers</SubLabel>
          <View style={panelBox}>
            {Object.entries(request.reqHeaders ?? DEFAULT_HEADERS).map(
              ([k, v]) => (
                <HeaderLine key={k} k={k} v={v} />
              ),
            )}
          </View>
        </ScrollView>
      ) : null}

      {tab === "payload" ? (
        editable ? (
          <>
            <ScrollView
              className="px-4"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 14 }}
            >
              <SubLabel tint={C.cyan}>Request Payload · editable</SubLabel>
              <TextInput
                value={editText}
                onChangeText={(t) => {
                  setEditText(t);
                  setError(null);
                }}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType={
                  Platform.OS === "ios" ? "ascii-capable" : "visible-password"
                }
                className="font-mono text-[12.5px] leading-5"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#05060A",
                  borderWidth: 1,
                  borderColor: C.line2,
                  padding: 13,
                  color: C.cyan,
                  minHeight: 180,
                  textAlignVertical: "top",
                }}
              />
              {error ? (
                <Text className="mt-2 text-[13px]" style={{ color: C.flaw }}>
                  {error}
                </Text>
              ) : (
                <Text className="mt-2 text-[13px]" style={{ color: C.muted }}>
                  This is what your browser is about to send. Change any value,
                  then re-send it.
                </Text>
              )}
            </ScrollView>
            <View
              className="flex-row gap-3 px-4 py-3"
              style={{ borderTopWidth: 1, borderTopColor: C.line }}
            >
              <Pressable
                onPress={cancel}
                className="flex-1 items-center justify-center rounded-xl py-3.5 active:opacity-70"
                style={{ borderWidth: 1, borderColor: C.line2 }}
              >
                <Text className="font-semibold" style={{ color: C.dim }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={resend} className="flex-[1.5] active:opacity-90">
                <LinearGradient
                  colors={COOL}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 12,
                    paddingVertical: 14,
                  }}
                >
                  <Ionicons name="paper-plane" size={16} color={C.void} />
                  <Text className="font-bold" style={{ color: C.void }}>
                    Edit and Resend
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        ) : (
          <ScrollView
            className="px-4"
            contentContainerStyle={{ paddingVertical: 14, paddingBottom: insets.bottom + 20 }}
          >
            <Text className="text-sm" style={{ color: C.muted }}>
              This request has no payload.
            </Text>
          </ScrollView>
        )
      ) : null}

      {tab === "response" ? (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingVertical: 14, paddingBottom: insets.bottom + 20 }}
        >
          <SubLabel tint={resent ? C.cyan : undefined}>
            {resent ? "Response · re-sent" : "Response"}
          </SubLabel>
          {resp !== null && resp !== undefined ? (
            <Json value={resp} />
          ) : request.responseNote ? (
            <View style={panelBox}>
              <Text className="font-mono text-[13px]" style={{ color: C.muted }}>
                {request.responseNote}
              </Text>
            </View>
          ) : (
            <Text className="text-sm" style={{ color: C.muted }}>
              {editable
                ? "Re-send the request to see the response."
                : "(no body)"}
            </Text>
          )}
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const panelBox = {
  borderRadius: 12,
  backgroundColor: "#05060A",
  borderWidth: 1,
  borderColor: C.line,
  padding: 13,
} as const;

const DEFAULT_HEADERS: Record<string, string> = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent": "Mozilla/5.0 (OneFlaw Browser)",
};

function SubLabel({ children, tint }: { children: ReactNode; tint?: string }) {
  return (
    <Text
      className="mb-2 font-mono text-[10px] uppercase tracking-[2px]"
      style={{ color: tint ?? C.muted }}
    >
      {children}
    </Text>
  );
}

function HeaderLine({ k, v }: { k: string; v: string }) {
  return (
    <View className="flex-row flex-wrap py-0.5">
      <Text className="font-mono text-[12px]" style={{ color: C.iris }}>
        {k}:{" "}
      </Text>
      <Text className="font-mono text-[12px]" style={{ color: C.dim }}>
        {v}
      </Text>
    </View>
  );
}

export function DevToolsPanel({
  requests,
  onClose,
}: {
  requests: NetworkRequest[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(900);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    y.value = withTiming(0, { duration: 300 });
  }, [y]);
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  const req = selected === null ? null : requests[selected];

  return (
    <View className="absolute inset-0" style={{ zIndex: 30 }}>
      <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
      <Animated.View
        style={[
          panelStyle,
          { paddingTop: insets.top + 6, backgroundColor: C.void2 },
        ]}
        className="absolute bottom-0 left-0 right-0 top-14 overflow-hidden rounded-t-2xl"
      >
        {/* Header */}
        <View
          className="flex-row items-center gap-2 px-4 pb-2.5 pt-1"
          style={{ borderBottomWidth: 1, borderBottomColor: C.line }}
        >
          {req ? (
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={C.muted} />
            </Pressable>
          ) : (
            <Ionicons name="pulse" size={16} color={C.cyan} />
          )}
          <Text className="flex-1 font-mono text-[13px] tracking-wide text-ice">
            NETWORK
          </Text>
          {!req ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ borderWidth: 1, borderColor: C.line2 }}
            >
              <Text className="font-mono text-[10px]" style={{ color: C.muted }}>
                {requests.length} requests
              </Text>
            </View>
          ) : null}
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={C.muted} />
          </Pressable>
        </View>

        {/* Panel tab row (only Network is interactive) */}
        <View
          className="flex-row px-2"
          style={{ borderBottomWidth: 1, borderBottomColor: C.line }}
        >
          {PANEL_TABS.map((t) => {
            const active = t === "Network";
            return (
              <View
                key={t}
                className="px-3 py-2"
                style={
                  active
                    ? { borderBottomWidth: 2, borderBottomColor: C.cyan }
                    : undefined
                }
              >
                <Text
                  className="font-mono text-[11px]"
                  style={{ color: active ? C.cyan : C.faint }}
                >
                  {t}
                </Text>
              </View>
            );
          })}
        </View>

        {req ? (
          <RequestDetail key={selected} request={req} />
        ) : (
          <View className="flex-1">
            <Scanline />
            <ScrollView
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
              {requests.length === 0 ? (
                <Text
                  className="px-5 pt-6 text-center text-sm"
                  style={{ color: C.muted }}
                >
                  No network activity captured.
                </Text>
              ) : (
                requests.map((r, i) => {
                  const frac = timeFraction(r.time);
                  return (
                    <Pressable
                      key={`${r.method}-${r.path}-${i}`}
                      onPress={() => setSelected(i)}
                      className="px-4 py-2.5 active:opacity-70"
                      style={{ borderBottomWidth: 1, borderBottomColor: "rgba(150,170,210,0.05)" }}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text
                          className="w-10 font-mono text-[10px] font-bold"
                          style={{ color: methodColor[r.method] ?? C.muted }}
                        >
                          {r.method}
                        </Text>
                        <Text
                          className="flex-1 font-mono text-[12.5px]"
                          style={{ color: C.ice }}
                          numberOfLines={1}
                        >
                          {r.path}
                        </Text>
                        {/* waterfall */}
                        <View
                          style={{
                            width: 44,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: "rgba(255,255,255,0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: 4,
                              width: `${frac * 100}%`,
                              borderRadius: 2,
                              backgroundColor: methodColor[r.method] ?? C.muted,
                            }}
                          />
                        </View>
                        <Text
                          className="w-8 text-right font-mono text-[11px]"
                          style={{ color: statusColor(r.status) }}
                        >
                          {r.status}
                        </Text>
                      </View>
                      <Text
                        className="ml-[52px] mt-0.5 font-mono text-[10.5px]"
                        style={{ color: C.faint }}
                      >
                        {(r.type ?? "fetch") + " · " + (r.size ?? "—") + " · " + (r.time ?? "—")}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
