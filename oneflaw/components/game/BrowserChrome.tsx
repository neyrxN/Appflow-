import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { C, LiveDot } from "./fx";

/**
 * OneFlaw's simulated command bar — the cool, premium chrome that wraps every
 * fictional site. Back/forward, a mono address pill with a live connection dot,
 * an optional notification bell, and a ⋮ menu (Developer Tools + Exit).
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
  // Typed text is preserved until Go, then re-synced on committed URL changes.
  const [draft, setDraft] = useState(url);
  useEffect(() => setDraft(url), [url]);

  return (
    <View
      className="px-2.5 pb-3 pt-2"
      style={{
        backgroundColor: C.panel2,
        borderBottomWidth: 1,
        borderBottomColor: C.line,
      }}
    >
      <View className="flex-row items-center gap-1.5">
        <NavBtn icon="chevron-back" onPress={onBack} />
        <NavBtn
          icon="chevron-forward"
          onPress={onForward}
          disabled={!canForward}
        />

        <View
          className="ml-0.5 h-8 flex-1 flex-row items-center gap-2 rounded-[9px] px-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            borderWidth: 1,
            borderColor: C.line2,
          }}
        >
          <Ionicons name="lock-closed" size={11} color={C.good} />
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
            className="flex-1 font-mono text-[12px]"
            style={{ color: C.dim, paddingVertical: 0 }}
          />
          <LiveDot size={6} />
        </View>

        {showBell ? <NavBtn icon="notifications" onPress={onBell} /> : null}
        <NavBtn icon="ellipsis-vertical" onPress={onMenu} />
      </View>
    </View>
  );
}

function NavBtn({
  icon,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
      style={{ borderWidth: 1, borderColor: C.line, backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      <Ionicons name={icon} size={16} color={disabled ? C.faint : C.dim} />
    </Pressable>
  );
}
