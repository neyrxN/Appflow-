import { useEffect, useState } from "react";
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NetworkRequest } from "@/puzzles/types";

const methodColor: Record<string, string> = {
  GET: "#38bdf8",
  POST: "#22e07a",
  PUT: "#eab308",
  DELETE: "#f87171",
};

// Real DevTools panel tabs — only Network is interactive here.
const PANEL_TABS = ["Elements", "Console", "Network", "Sources", "Performance"];

/** Read-only pretty JSON (handles nested objects/arrays); selectable to copy. */
function Json({ value }: { value: unknown }) {
  return (
    <View className="rounded-xl bg-black/40 p-4">
      <Text
        selectable
        className="font-mono text-[12.5px] leading-5 text-slate-200"
      >
        {JSON.stringify(value, null, 2)}
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      className="flex-1"
    >
      {/* Request summary */}
      <View className="flex-row items-center gap-2 px-4 py-2.5">
        <Text
          className="font-mono text-[11px] font-bold"
          style={{ color: methodColor[request.method] ?? "#94a3b8" }}
        >
          {request.method}
        </Text>
        <Text
          className="flex-1 font-mono text-[12px] text-slate-300"
          numberOfLines={1}
        >
          {request.path}
        </Text>
        <Text className="text-[11px] text-emerald-400">{request.status}</Text>
      </View>

      {/* Sub-tabs */}
      <View className="flex-row border-b border-slate-800 px-2">
        {subTabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`px-3 py-2 ${tab === t ? "border-b-2 border-accent" : ""}`}
          >
            <Text
              className={`text-[13px] capitalize ${
                tab === t ? "font-semibold text-accent" : "text-slate-400"
              }`}
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
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            General
          </Text>
          <View className="mb-4 rounded-xl bg-black/40 p-4">
            <HeaderLine k="Request URL" v={`https://${request.path}`} />
            <HeaderLine k="Request Method" v={request.method} />
            <HeaderLine k="Status Code" v={`${request.status}`} />
          </View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Request Headers
          </Text>
          <View className="rounded-xl bg-black/40 p-4">
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
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Request Payload · editable
              </Text>
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
                className="rounded-xl bg-black/40 p-4 font-mono text-[12.5px] leading-5 text-accent"
                style={{ minHeight: 180, textAlignVertical: "top" }}
              />
              {error ? (
                <Text className="mt-2 text-[13px] text-red-400">{error}</Text>
              ) : (
                <Text className="mt-2 text-[13px] text-slate-500">
                  This is what your browser is about to send. Change any value,
                  then re-send it.
                </Text>
              )}
            </ScrollView>
            <View className="flex-row gap-3 border-t border-slate-800 px-4 py-3">
              <Pressable
                onPress={cancel}
                className="flex-1 items-center justify-center rounded-xl border border-slate-700 py-3.5 active:bg-slate-800"
              >
                <Text className="font-semibold text-slate-200">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={resend}
                className="flex-[1.5] flex-row items-center justify-center gap-2 rounded-xl bg-accent py-3.5 active:bg-accent-dark"
              >
                <Ionicons name="paper-plane" size={16} color="#0b0f14" />
                <Text className="font-bold text-ink">Edit and Resend</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <ScrollView
            className="px-4"
            contentContainerStyle={{ paddingVertical: 14, paddingBottom: insets.bottom + 20 }}
          >
            <Text className="text-sm text-slate-500">
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
          {resent ? (
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
              Response · re-sent
            </Text>
          ) : (
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Response
            </Text>
          )}
          {resp !== null && resp !== undefined ? (
            <Json value={resp} />
          ) : request.responseNote ? (
            <View className="rounded-xl bg-black/40 p-4">
              <Text className="font-mono text-[13px] text-slate-400">
                {request.responseNote}
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-slate-500">
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

const DEFAULT_HEADERS: Record<string, string> = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent": "Mozilla/5.0 (OneFlaw Browser)",
};

function HeaderLine({ k, v }: { k: string; v: string }) {
  return (
    <View className="flex-row flex-wrap py-0.5">
      <Text className="font-mono text-[12px] text-sky-300">{k}: </Text>
      <Text className="font-mono text-[12px] text-slate-300">{v}</Text>
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
      <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
      <Animated.View
        style={[panelStyle, { paddingTop: insets.top + 6 }]}
        className="absolute bottom-0 left-0 right-0 top-14 rounded-t-2xl bg-slate-900"
      >
        {/* Header */}
        <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
          {req ? (
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color="#94a3b8" />
            </Pressable>
          ) : (
            <Ionicons name="build" size={15} color="#22e07a" />
          )}
          <Text className="flex-1 text-[14px] font-bold text-white">
            DevTools
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Panel tab row (only Network is interactive) */}
        <View className="flex-row border-b border-slate-800 px-2">
          {PANEL_TABS.map((t) => {
            const active = t === "Network";
            return (
              <View
                key={t}
                className={`px-3 py-2 ${active ? "border-b-2 border-accent" : ""}`}
              >
                <Text
                  className={`text-[12px] ${
                    active ? "font-semibold text-accent" : "text-slate-600"
                  }`}
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
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {/* Column header */}
            <View className="flex-row items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2">
              <Text className="w-10 text-[10px] font-semibold uppercase text-slate-600">
                Name
              </Text>
              <Text className="flex-1" />
              <Text className="text-[10px] font-semibold uppercase text-slate-600">
                Status
              </Text>
            </View>
            {requests.length === 0 ? (
              <Text className="px-5 pt-6 text-center text-sm text-slate-500">
                No network activity captured.
              </Text>
            ) : (
              requests.map((r, i) => (
                <Pressable
                  key={`${r.method}-${r.path}-${i}`}
                  onPress={() => setSelected(i)}
                  className="border-b border-slate-800 px-4 py-2.5 active:bg-slate-800"
                >
                  <View className="flex-row items-center gap-3">
                    <Text
                      className="w-10 font-mono text-[10px] font-bold"
                      style={{ color: methodColor[r.method] ?? "#94a3b8" }}
                    >
                      {r.method}
                    </Text>
                    <Text
                      className="flex-1 font-mono text-[13px] text-slate-200"
                      numberOfLines={1}
                    >
                      {r.path}
                    </Text>
                    <Text className="text-[12px] text-emerald-400">
                      {r.status}
                    </Text>
                  </View>
                  <Text className="ml-[52px] mt-0.5 text-[11px] text-slate-500">
                    {(r.type ?? "fetch") + " · " + (r.size ?? "—") + " · " + (r.time ?? "—")}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}
