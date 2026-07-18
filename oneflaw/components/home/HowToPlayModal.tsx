import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function HowToPlayModal({
  visible,
  firstRun,
  onDismiss,
}: {
  visible: boolean;
  firstRun: boolean;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Pressable
          className="absolute inset-0"
          onPress={onDismiss}
          accessible={false}
        />

        <View
          accessibilityViewIsModal
          accessibilityLabel={
            firstRun ? "Welcome to OneFlaw" : "How to play OneFlaw"
          }
          onAccessibilityEscape={onDismiss}
          style={{ paddingBottom: insets.bottom + 20 }}
          className="max-h-[92vh] rounded-t-[32px] border-t border-slate-700 bg-slate-950 px-6 pt-3"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <View className="h-1.5 w-12 rounded-full bg-slate-700" />
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel={
                firstRun ? "Skip introduction" : "Close how to play"
              }
              hitSlop={4}
              className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-800"
            >
              <Ionicons name="close" size={23} color="#cbd5e1" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#9fb7aa]">
              {firstRun ? "Welcome, investigator" : "Quick refresher"}
            </Text>
            <Text
              accessibilityRole="header"
              className="mt-2 text-3xl font-extrabold tracking-tight text-white"
            >
              Find the one flaw.
            </Text>
            <Text className="mt-2 text-[15px] leading-6 text-slate-300">
              Each case is a tiny fictional app with one security mistake hiding
              in plain sight.
            </Text>

            <View className="mt-6 gap-4">
              <HowToStep
                number="1"
                icon="game-controller-outline"
                title="Pick any case"
                body="Cases are short, and every one is unlocked from the start."
              />
              <HowToStep
                number="2"
                icon="search-outline"
                title="Explore and experiment"
                body="Tap, type, inspect and try ideas. Hints are there when you need them."
              />
              <HowToStep
                number="3"
                icon="school-outline"
                title="Learn what happened"
                body="Crack the case to reveal the risk and how developers prevent it."
              />
            </View>

            <View className="mt-6 flex-row items-start gap-3 rounded-2xl bg-slate-900 p-4">
              <Ionicons name="shield-checkmark" size={20} color="#9fb7aa" />
              <Text className="flex-1 text-[13px] leading-5 text-slate-300">
                No lives, timers or penalties. Nothing here connects to a real
                app, person or account.
              </Text>
            </View>

            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Start playing"
              className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-[#9fb7aa] px-5 py-3.5 active:bg-[#8da397]"
            >
              <Text className="text-base font-extrabold text-ink">
                Show me the cases
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#0b0f14" />
            </Pressable>

            {firstRun ? (
              <Pressable
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel="Skip introduction"
                className="mb-1 mt-2 min-h-12 items-center justify-center rounded-xl"
              >
                <Text className="text-sm font-semibold text-slate-400">
                  Skip intro
                </Text>
              </Pressable>
            ) : (
              <View className="h-4" />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function HowToStep({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
        <Ionicons name={icon} size={21} color="#9fb7aa" />
        <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-slate-700">
          <Text className="text-[10px] font-extrabold text-white">
            {number}
          </Text>
        </View>
      </View>
      <View className="flex-1 pt-0.5">
        <Text className="text-[15px] font-bold text-white">{title}</Text>
        <Text className="mt-0.5 text-[13px] leading-5 text-slate-400">
          {body}
        </Text>
      </View>
    </View>
  );
}
