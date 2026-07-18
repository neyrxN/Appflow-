import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * OneFlaw's simulated browser frame — visually distinct from the fictional
 * website rendered inside it. Provides back/forward, an address field with a
 * visible Go action, an optional notification bell, and a ⋮ menu (which the
 * shell turns into Developer Tools + Exit).
 */
export function BrowserChrome({
  url,
  editable,
  onGo,
  onBack,
  onForward,
  canForward,
  onMenu,
  showBell,
  onBell,
}: {
  url: string;
  editable: boolean;
  onGo: (v: string) => void;
  onBack: () => void;
  onForward: () => void;
  canForward: boolean;
  onMenu: () => void;
  showBell?: boolean;
  onBell?: () => void;
}) {
  // Local editing buffer: typed text is preserved until the player presses Go,
  // and only re-synced when the committed URL changes (back/forward/link nav).
  const [draft, setDraft] = useState(url);
  useEffect(() => setDraft(url), [url]);

  return (
    <View className="bg-slate-800 px-2 py-2">
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          className="h-9 w-8 items-center justify-center rounded-full active:bg-slate-700"
        >
          <Ionicons name="chevron-back" size={22} color="#e2e8f0" />
        </Pressable>
        <Pressable
          onPress={onForward}
          disabled={!canForward}
          hitSlop={8}
          className="h-9 w-8 items-center justify-center rounded-full active:bg-slate-700"
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={canForward ? "#e2e8f0" : "#475569"}
          />
        </Pressable>

        <View className="ml-1 flex-1 flex-row items-center rounded-full bg-slate-100 px-3">
          <Ionicons name="lock-closed" size={12} color="#64748b" />
          <TextInput
            value={draft}
            editable={editable}
            onChangeText={setDraft}
            onSubmitEditing={() => onGo(draft)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            keyboardType="default"
            returnKeyType="go"
            submitBehavior="blurAndSubmit"
            selectTextOnFocus
            className="ml-1.5 flex-1 py-1.5 font-mono text-[13px] text-slate-800"
            style={{ paddingVertical: 0 }}
          />
        </View>

        {showBell ? (
          <Pressable
            onPress={onBell}
            hitSlop={8}
            className="h-9 w-8 items-center justify-center rounded-full active:bg-slate-700"
          >
            <Ionicons name="notifications" size={17} color="#e2e8f0" />
          </Pressable>
        ) : null}

        <Pressable
          onPress={onMenu}
          hitSlop={8}
          className="h-9 w-8 items-center justify-center rounded-full active:bg-slate-700"
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#e2e8f0" />
        </Pressable>
      </View>
    </View>
  );
}
