import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Two deliberately separate layers:
 * - OneFlaw's training bar owns Exit, notifications, and Tools.
 * - The simulated browser owns page history and the fictional address.
 *
 * Keeping these layers separate prevents browser Back from unexpectedly
 * exiting a challenge and makes the tools required by several puzzles visible.
 */
export function BrowserChrome({
  url,
  editable,
  onGo,
  onBack,
  onForward,
  canBack,
  canForward,
  onExit,
  onTools,
  showBell,
  onBell,
}: {
  url: string;
  editable: boolean;
  onGo: (v: string) => void;
  onBack: () => void;
  onForward: () => void;
  canBack: boolean;
  canForward: boolean;
  onExit: () => void;
  onTools: () => void;
  showBell?: boolean;
  onBell?: () => void;
}) {
  const [draft, setDraft] = useState(url);
  useEffect(() => setDraft(url), [url]);

  return (
    <View className="border-b border-slate-700 bg-slate-800">
      {/* App controls: always visibly distinct from the fictional website. */}
      <View className="flex-row items-center gap-2 border-b border-slate-700 bg-slate-950 px-3 py-2">
        <Pressable
          onPress={onExit}
          accessibilityRole="button"
          accessibilityLabel="Exit challenge"
          accessibilityHint="Returns to the OneFlaw challenge list."
          className="min-h-12 flex-row items-center justify-center gap-1 rounded-xl border border-slate-700 px-2.5 active:bg-slate-800"
        >
          <Ionicons
            name="close"
            size={18}
            color="#e2e8f0"
            accessible={false}
          />
          <Text className="text-sm font-semibold text-slate-100">Exit</Text>
        </Pressable>

        <View
          className="min-w-0 flex-1"
          accessible
          accessibilityLabel="OneFlaw fictional training browser"
        >
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="text-sm font-bold text-white"
          >
            OneFlaw lab
          </Text>
          <Text numberOfLines={1} className="text-[11px] font-semibold text-[#789f90]">
            Fictional training browser
          </Text>
        </View>

        {showBell ? (
          <Pressable
            onPress={onBell}
            accessibilityRole="button"
            accessibilityLabel="Open latest notification"
            accessibilityHint="Shows the most recent message again."
            className="h-12 w-12 items-center justify-center rounded-xl active:bg-slate-800"
          >
            <Ionicons
              name="notifications"
              size={19}
              color="#e2e8f0"
              accessible={false}
            />
          </Pressable>
        ) : null}

        <Pressable
          onPress={onTools}
          accessibilityRole="button"
          accessibilityLabel="Tools"
          accessibilityHint="Opens the training browser's network tools."
          className="min-h-12 flex-row items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 active:bg-slate-700"
        >
          <Ionicons
            name="build-outline"
            size={17}
            color="#789f90"
            accessible={false}
          />
          <Text className="text-sm font-bold text-slate-100">Tools</Text>
        </Pressable>
      </View>

      {/* Simulated browser controls. */}
      <View className="flex-row items-end gap-1 px-3 py-2.5">
        <Pressable
          onPress={onBack}
          disabled={!canBack}
          accessibilityRole="button"
          accessibilityLabel="Previous browser page"
          accessibilityState={{ disabled: !canBack }}
          className={`h-12 w-12 items-center justify-center rounded-xl ${
            canBack ? "active:bg-slate-700" : "opacity-40"
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#e2e8f0"
            accessible={false}
          />
        </Pressable>
        <Pressable
          onPress={onForward}
          disabled={!canForward}
          accessibilityRole="button"
          accessibilityLabel="Next browser page"
          accessibilityState={{ disabled: !canForward }}
          className={`h-12 w-12 items-center justify-center rounded-xl ${
            canForward ? "active:bg-slate-700" : "opacity-40"
          }`}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#e2e8f0"
            accessible={false}
          />
        </Pressable>

        <View className="min-w-0 flex-1">
          <Text className="mb-1 ml-1 text-[11px] font-bold uppercase tracking-wide text-slate-300">
            Website address
          </Text>
          {editable ? (
            <View className="min-h-12 flex-row items-center rounded-xl bg-slate-100 px-3">
              <Ionicons
                name="lock-closed"
                size={13}
                color="#475569"
                accessible={false}
              />
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => onGo(draft)}
                accessibilityLabel="Website address"
                accessibilityHint="Edit the fictional address, then choose Go."
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                keyboardType="default"
                returnKeyType="go"
                submitBehavior="blurAndSubmit"
                selectTextOnFocus
                className="ml-2 min-h-12 min-w-0 flex-1 font-mono text-[14px] text-slate-900"
                style={{ paddingVertical: 0 }}
              />
            </View>
          ) : (
            <View
              accessible
              accessibilityLabel={`Website address, ${url}, read only`}
              className="min-h-12 flex-row items-center rounded-xl bg-slate-100 px-3"
            >
              <Ionicons
                name="lock-closed"
                size={13}
                color="#475569"
                accessible={false}
              />
              <Text
                numberOfLines={1}
                className="ml-2 min-w-0 flex-1 font-mono text-[14px] text-slate-900"
              >
                {url}
              </Text>
            </View>
          )}
        </View>

        {editable ? (
          <Pressable
            onPress={() => onGo(draft)}
            accessibilityRole="button"
            accessibilityLabel="Go to edited address"
            className="h-12 min-w-12 items-center justify-center rounded-xl bg-[#789f90] px-3 active:bg-[#648576]"
          >
            <Text className="text-sm font-extrabold text-ink">Go</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
