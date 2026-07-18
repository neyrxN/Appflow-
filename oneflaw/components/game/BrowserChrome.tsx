import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useReducedMotion } from "react-native-reanimated";

function compactUrl(value: string, narrow: boolean) {
  const maxLength = narrow ? 14 : 21;
  if (value.length <= maxLength) return value;
  const [host, ...path] = value.split("/");
  const tail = path.at(-1);
  if (!tail) return value;
  const hostLength = narrow ? 5 : 10;
  const shortHost =
    host.length > hostLength ? `${host.slice(0, hostLength)}…` : host;
  return `${shortHost}/${tail}`;
}

/** A compact, phone-sized browser bar for the fictional site. */
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
  const [addressFocused, setAddressFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(72);
  const chromeRef = useRef<View>(null);
  const reduceMotion = useReducedMotion();
  const narrow = useWindowDimensions().width < 360;

  useEffect(() => setDraft(url), [url]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    setMenuOpen(true);
    chromeRef.current?.measureInWindow((_x, y, _width, height) => {
      setMenuTop(y + height + 6);
    });
  }, [closeMenu, menuOpen]);

  const submitAddress = useCallback(() => {
    const next = draft.trim();
    if (next) onGo(next);
  }, [draft, onGo]);

  const showAddressAction =
    editable && (addressFocused || draft.trim() !== url);

  return (
    <>
      <View
        ref={chromeRef}
        className="z-20 border-b border-[#303138] bg-[#1b1c21] px-3 py-2.5"
      >
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={onBack}
            disabled={!canBack}
            accessibilityRole="button"
            accessibilityLabel="Previous browser page"
            accessibilityState={{ disabled: !canBack }}
            className={`h-11 w-11 items-center justify-center rounded-xl border border-[#34353d] bg-[#202127] ${
              canBack ? "active:bg-[#2a2b32]" : "opacity-35"
            }`}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color="#d4d4d8"
              accessible={false}
            />
          </Pressable>

          <Pressable
            onPress={onForward}
            disabled={!canForward}
            accessibilityRole="button"
            accessibilityLabel="Next browser page"
            accessibilityState={{ disabled: !canForward }}
            className={`h-11 w-11 items-center justify-center rounded-xl border border-[#34353d] bg-[#202127] ${
              canForward ? "active:bg-[#2a2b32]" : "opacity-35"
            }`}
          >
            <Ionicons
              name="chevron-forward"
              size={23}
              color="#d4d4d8"
              accessible={false}
            />
          </Pressable>

          <View className="h-11 min-w-0 flex-1 flex-row items-center rounded-2xl border border-[#35363e] bg-[#111216] px-3">
            <Ionicons
              name="lock-closed"
              size={14}
              color="#68a47f"
              accessible={false}
            />

            {editable && addressFocused ? (
              <TextInput
                autoFocus
                value={draft}
                onChangeText={setDraft}
                onBlur={() => setAddressFocused(false)}
                onSubmitEditing={submitAddress}
                accessibilityLabel="Website address"
                accessibilityHint="Edit the address and press Go on the keyboard."
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                returnKeyType="go"
                submitBehavior="blurAndSubmit"
                selectTextOnFocus
                className="ml-2 min-h-11 min-w-0 flex-1 font-mono text-[13px] text-zinc-300"
                style={{ paddingVertical: 0 }}
              />
            ) : editable ? (
              <Pressable
                onPress={() => setAddressFocused(true)}
                accessibilityRole="button"
                accessibilityLabel={`Edit website address, ${draft}`}
                className="ml-2 min-h-11 min-w-0 flex-1 justify-center"
              >
                <Text
                  numberOfLines={1}
                  className="font-mono text-[13px] text-zinc-300"
                >
                  {compactUrl(draft, narrow)}
                </Text>
              </Pressable>
            ) : (
              <Text
                accessible
                accessibilityLabel={`Secure website address, ${url}, read only`}
                numberOfLines={1}
                className="ml-2 min-w-0 flex-1 font-mono text-[13px] text-zinc-300"
              >
                {compactUrl(url, narrow)}
              </Text>
            )}

            {showAddressAction ? (
              <Pressable
                onPress={submitAddress}
                accessibilityRole="button"
                accessibilityLabel="Go to edited address"
                hitSlop={6}
                className="ml-1 h-9 w-9 items-center justify-center rounded-full active:bg-[#292b30]"
              >
                <Ionicons
                  name="arrow-forward-circle"
                  size={24}
                  color="#9cafaa"
                  accessible={false}
                />
              </Pressable>
            ) : (
              <View
                accessible
                accessibilityLabel="Connection active"
                className="ml-2 h-2 w-2 rounded-full bg-[#4f8a68]"
              />
            )}
          </View>

          <Pressable
            onPress={toggleMenu}
            accessibilityRole="button"
            accessibilityLabel={
              menuOpen ? "Close browser menu" : "Open browser menu"
            }
            accessibilityState={{ expanded: menuOpen }}
            className="h-11 w-11 items-center justify-center rounded-xl border border-[#34353d] bg-[#202127] active:bg-[#2a2b32]"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={21}
              color="#d4d4d8"
              accessible={false}
            />
            {showBell ? (
              <View className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#b49a73]" />
            ) : null}
          </Pressable>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        statusBarTranslucent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={closeMenu}
      >
        <View className="flex-1">
          <Pressable
            onPress={closeMenu}
            accessibilityRole="button"
            accessibilityLabel="Close browser menu"
            className="absolute inset-0 bg-black/10"
          />

          <View
            accessibilityViewIsModal
            onAccessibilityEscape={closeMenu}
            className="absolute right-3 w-[270px] overflow-hidden rounded-2xl border border-[#3b3c44] bg-[#202127]"
            style={{
              top: menuTop,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.38,
              shadowRadius: 24,
              elevation: 14,
            }}
          >
            <Pressable
              onPress={() => {
                closeMenu();
                onTools();
              }}
              accessibilityRole="menuitem"
              className="min-h-14 flex-row items-center gap-3 px-4 active:bg-[#2b2c33]"
            >
              <Ionicons
                name="pulse-outline"
                size={22}
                color="#8fa4a0"
                accessible={false}
              />
              <Text className="text-[17px] font-medium text-zinc-100">
                Developer Tools
              </Text>
            </Pressable>

            {showBell && onBell ? (
              <Pressable
                onPress={() => {
                  closeMenu();
                  onBell();
                }}
                accessibilityRole="menuitem"
                className="min-h-14 flex-row items-center gap-3 border-t border-[#383940] px-4 active:bg-[#2b2c33]"
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#a4a4ad"
                  accessible={false}
                />
                <Text className="text-[17px] font-medium text-zinc-100">
                  Latest notification
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => {
                closeMenu();
                onExit();
              }}
              accessibilityRole="menuitem"
              className="min-h-14 flex-row items-center gap-3 border-t border-[#383940] px-4 active:bg-[#2b2c33]"
            >
              <Ionicons
                name="exit-outline"
                size={22}
                color="#a4a4ad"
                accessible={false}
              />
              <Text className="text-[17px] font-medium text-zinc-100">
                Exit to OneFlaw
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
