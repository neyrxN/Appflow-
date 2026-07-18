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
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NetworkRequest } from "@/puzzles/types";

const methodColor: Record<string, string> = {
  GET: "#7f9fb0",
  POST: "#82aa98",
  PUT: "#ad9d73",
  DELETE: "#b98282",
};

/** Read-only pretty JSON (handles nested objects/arrays); selectable to copy. */
function Json({ value }: { value: unknown }) {
  return (
    <View className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <Text
        selectable
        accessibilityLabel={`Raw JSON: ${JSON.stringify(value)}`}
        className="font-mono text-[13px] leading-[21px] text-slate-200"
      >
        {JSON.stringify(value, null, 2)}
      </Text>
    </View>
  );
}

type SubTab = "headers" | "payload" | "response";

const SUB_TAB_LABELS: Record<SubTab, string> = {
  headers: "Headers",
  payload: "Payload",
  response: "Response",
};

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
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
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
      <View className="border-b border-slate-800 px-4 pb-3 pt-1">
        <View className="flex-row items-center gap-3">
          <View className="rounded-lg bg-slate-800 px-2.5 py-1.5">
            <Text
              className="font-mono text-[12px] font-bold"
              style={{ color: methodColor[request.method] ?? "#94a3b8" }}
            >
              {request.method}
            </Text>
          </View>
          <Text
            selectable
            className="flex-1 font-mono text-[14px] text-slate-100"
            numberOfLines={2}
          >
            {request.path}
          </Text>
          <View className="rounded-full bg-slate-800 px-2.5 py-1.5">
            <Text
              className="font-mono text-[12px] font-semibold"
              style={{ color: "#91b3a4" }}
            >
              {request.status}
            </Text>
          </View>
        </View>
      </View>

      <View
        accessibilityRole="tablist"
        className="flex-row border-b border-slate-800 px-3"
      >
        {subTabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityLabel={`${SUB_TAB_LABELS[t]} request information`}
            accessibilityState={{ selected: tab === t }}
            className={`h-12 flex-1 items-center justify-center ${
              tab === t ? "border-b-2" : ""
            }`}
            style={tab === t ? { borderBottomColor: "#789f90" } : undefined}
          >
            <Text
              className={`text-[14px] ${tab === t ? "font-semibold" : "text-slate-400"}`}
              style={tab === t ? { color: "#91b3a4" } : undefined}
            >
              {SUB_TAB_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "headers" ? (
        <ScrollView
          className="px-4"
          contentContainerStyle={{
            paddingTop: 18,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Text className="mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-400">
            General
          </Text>
          <View className="mb-6 rounded-2xl border border-slate-800 bg-black/40 p-4">
            <HeaderLine k="Request path" v={request.path} />
            <HeaderLine k="Request Method" v={request.method} />
            <HeaderLine k="Status Code" v={`${request.status}`} />
          </View>
          <Text className="mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-400">
            Request headers
          </Text>
          <View className="rounded-2xl border border-slate-800 bg-black/40 p-4">
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
              contentContainerStyle={{ paddingTop: 18, paddingBottom: 16 }}
            >
              <Text className="mb-3 text-[12px] font-bold uppercase tracking-wide text-slate-300">
                Request payload · editable
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
                accessibilityLabel="Editable request payload in raw JSON"
                accessibilityHint="Change a value, then choose Send request"
                keyboardType={
                  Platform.OS === "ios" ? "ascii-capable" : "visible-password"
                }
                className="rounded-2xl border border-slate-700 bg-black/40 p-4 font-mono text-[13px] leading-[21px]"
                style={{
                  minHeight: 200,
                  textAlignVertical: "top",
                  color: "#9abdab",
                }}
              />
              {error ? (
                <Text
                  accessibilityLiveRegion="assertive"
                  className="mt-3 text-[14px] leading-5"
                  style={{ color: "#c99090" }}
                >
                  {error}
                </Text>
              ) : null}
            </ScrollView>
            <View
              className="flex-row gap-3 border-t border-slate-800 px-4 pt-3"
              style={{ paddingBottom: insets.bottom + 12 }}
            >
              <Pressable
                onPress={cancel}
                accessibilityRole="button"
                accessibilityLabel="Reset JSON changes"
                className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-700 active:bg-slate-800"
              >
                <Text className="font-semibold text-slate-200">Reset</Text>
              </Pressable>
              <Pressable
                onPress={resend}
                accessibilityRole="button"
                accessibilityLabel="Send edited request"
                className="h-12 flex-[1.6] flex-row items-center justify-center gap-2 rounded-xl bg-[#789f90] active:bg-[#648576]"
              >
                <Ionicons
                  name="paper-plane"
                  size={16}
                  color="#0b0f14"
                  accessible={false}
                />
                <Text className="font-bold text-ink">Send request</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <ScrollView
            className="px-4"
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text className="text-[15px] leading-6 text-slate-400">
              This request has no payload.
            </Text>
          </ScrollView>
        )
      ) : null}

      {tab === "response" ? (
        <ScrollView
          className="px-4"
          contentContainerStyle={{
            paddingTop: 18,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Text
            accessibilityLiveRegion={resent ? "polite" : "none"}
            className={`mb-1 text-[13px] font-bold ${resent ? "" : "text-slate-200"}`}
            style={resent ? { color: "#91b3a4" } : undefined}
          >
            {resent ? "Response · resent" : "Response"}
          </Text>
          {resp !== null && resp !== undefined ? (
            <Json value={resp} />
          ) : request.responseNote ? (
            <View className="rounded-2xl border border-slate-800 bg-black/40 p-4">
              <Text className="font-mono text-[13px] leading-5 text-slate-400">
                {request.responseNote}
              </Text>
            </View>
          ) : (
            <Text className="text-[15px] leading-6 text-slate-400">
              {editable
                ? "Send the request to view its response."
                : "This response has no body."}
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
    <View className="flex-row flex-wrap py-1">
      <Text
        className="font-mono text-[13px] leading-5"
        style={{ color: "#8eacbb" }}
      >
        {k}:{" "}
      </Text>
      <Text
        selectable
        className="font-mono text-[13px] leading-5 text-slate-300"
      >
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
    y.value = withTiming(0, {
      duration: 300,
      reduceMotion: ReduceMotion.System,
    });
  }, [y]);
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  const req = selected === null ? null : requests[selected];

  return (
    <View
      accessibilityLabel="Developer Tools, Network"
      accessibilityViewIsModal
      role="dialog"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 30,
      }}
    >
      <Pressable
        onPress={onClose}
        accessible={false}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(0, 0, 0, 0.58)",
        }}
      />
      <Animated.View
        style={[
          panelStyle,
          {
            position: "absolute",
            top: 56,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#0f172a",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
          },
        ]}
      >
        {/* Header */}
        <View className="flex-row items-center px-3 pb-2 pt-2">
          {req ? (
            <Pressable
              onPress={() => setSelected(null)}
              accessibilityRole="button"
              accessibilityLabel="Back to network requests"
              className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-800"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#cbd5e1"
                accessible={false}
              />
            </Pressable>
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <Ionicons
                name="git-network-outline"
                size={21}
                color="#91b3a4"
                accessible={false}
              />
            </View>
          )}
          <View className="ml-2 flex-1">
            <Text
              accessibilityRole="header"
              className="text-lg font-bold"
              style={{ color: "#f3efe5" }}
            >
              Developer Tools
            </Text>
            <Text className="mt-0.5 text-[13px] text-slate-400">
              Network · {requests.length}{" "}
              {requests.length === 1 ? "request" : "requests"}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close Developer Tools"
            className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-800"
          >
            <Ionicons
              name="close"
              size={24}
              color="#cbd5e1"
              accessible={false}
            />
          </Pressable>
        </View>

        {req ? (
          <RequestDetail key={selected} request={req} />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {requests.length === 0 ? (
              <View className="items-center px-6 pt-10">
                <Ionicons
                  name="radio-outline"
                  size={28}
                  color="#64748b"
                  accessible={false}
                />
                <Text className="mt-3 text-center text-[15px] font-semibold text-slate-300">
                  No requests captured
                </Text>
              </View>
            ) : (
              requests.map((r, i) => (
                <Pressable
                  key={`${r.method}-${r.path}-${i}`}
                  onPress={() => setSelected(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.method} ${r.path}, received status ${r.status}`}
                  accessibilityHint="Open headers, payload, and response"
                  className="min-h-16 border-b border-slate-800 px-4 py-3 active:bg-slate-800"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 rounded-lg bg-slate-800 py-1.5">
                      <Text
                        className="text-center font-mono text-[11px] font-bold"
                        style={{ color: methodColor[r.method] ?? "#94a3b8" }}
                      >
                        {r.method}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 font-mono text-[14px] leading-5 text-slate-100"
                      numberOfLines={2}
                    >
                      {r.path}
                    </Text>
                    <View className="items-end">
                      <Text
                        className="font-mono text-[13px] font-semibold"
                        style={{ color: "#91b3a4" }}
                      >
                        {r.status}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#64748b"
                      accessible={false}
                    />
                  </View>
                  <Text className="ml-[60px] mt-1 text-[12px] text-slate-400">
                    {(r.type ?? "fetch") +
                      " · " +
                      (r.size ?? "—") +
                      " · " +
                      (r.time ?? "—")}
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
