import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function HowToPlayModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
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
          accessibilityLabel="How to play OneFlaw"
          onAccessibilityEscape={onDismiss}
          style={{ paddingBottom: insets.bottom + 20 }}
          className="rounded-t-[30px] border-t border-[#30363d] bg-[#11151a] px-6 pt-3"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <View className="h-1.5 w-12 rounded-full bg-[#383e45]" />
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close game guide"
              hitSlop={4}
              className="h-12 w-12 items-center justify-center rounded-full active:bg-[#20252b]"
            >
              <Ionicons name="close" size={23} color="#c5c9ce" />
            </Pressable>
          </View>

          <Text
            accessibilityRole="header"
            className="text-[26px] font-extrabold tracking-tight text-[#f4f1e9]"
          >
            Find the one flaw.
          </Text>
          <Text className="mt-2 max-w-[340px] text-[15px] leading-6 text-[#a7adb5]">
            Pick a case, explore the fake app, and make it do something it
            should not.
          </Text>

          <View className="my-6 flex-row items-center justify-between rounded-2xl bg-[#191e24] px-4 py-4">
            <QuickStep icon="hand-left-outline" label="Pick" />
            <Ionicons name="chevron-forward" size={16} color="#606871" />
            <QuickStep icon="search-outline" label="Explore" />
            <Ionicons name="chevron-forward" size={16} color="#606871" />
            <QuickStep icon="flag-outline" label="Solve" />
          </View>

          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close guide and choose a case"
            className="min-h-12 items-center justify-center rounded-2xl bg-[#9fb7aa] px-5 py-3.5 active:bg-[#8da397]"
          >
            <Text className="text-base font-extrabold text-[#0b0e12]">
              Choose a case
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function QuickStep({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="items-center gap-1.5">
      <Ionicons name={icon} size={21} color="#9fb7aa" />
      <Text className="text-xs font-bold text-[#c5c9ce]">{label}</Text>
    </View>
  );
}
