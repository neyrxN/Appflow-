import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GameCtx, Puzzle } from "@/puzzles/types";

const START_PENCE = 3000; // £30.00
const WIN_UNDER_PENCE = 2000; // must drop below £20.00
const COUPON = "READ20";

const money = (pence: number) => `£${(pence / 100).toFixed(2)}`;

type Banner = { kind: "success" | "error"; text: string } | null;

function CouponSite({ game }: { game: GameCtx }) {
  const [total, setTotal] = useState(START_PENCE);
  const [applied, setApplied] = useState(0);
  const [code, setCode] = useState("");
  const [banner, setBanner] = useState<Banner>(null);

  const gameRef = useRef(game);
  gameRef.current = game;

  // The code arrives as a push notification — never as a static tip.
  useEffect(() => {
    const t = setTimeout(() => {
      gameRef.current.notify({
        title: "🎉 Here's 20% off your next order",
        body: `Use code ${COUPON} before it's gone!`,
      });
    }, 900);
    return () => clearTimeout(t);
  }, []);

  function apply() {
    const entered = code.trim().toUpperCase();
    if (entered !== COUPON) {
      setBanner({
        kind: "error",
        text: entered ? "That code isn't valid." : "Enter a discount code.",
      });
      return;
    }
    // BUG: the same coupon is accepted every time and the discount stacks.
    const next = Math.round(total * 0.8);
    setTotal(next);
    setApplied((n) => n + 1);
    setCode("");
    setBanner({
      kind: "success",
      text: `Discount applied — 20% off. New total ${money(next)}.`,
    });
    if (next < WIN_UNDER_PENCE) gameRef.current.win();
  }

  const discount = START_PENCE - total;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5 flex-row items-center gap-2">
        <Text className="text-2xl">📚</Text>
        <Text className="text-xl font-extrabold text-slate-900">Marginalia</Text>
        <Text className="ml-auto text-sm text-slate-500">Checkout</Text>
      </View>

      {/* Cart */}
      <View className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <CartLine label="Hardback Novel" value="£24.99" />
        <CartLine label="Cloth Bookmark" value="£5.01" />

        {applied > 0 ? (
          <View className="mt-1 border-t border-dashed border-slate-300 pt-2">
            {Array.from({ length: applied }).map((_, i) => (
              <View key={i} className="flex-row justify-between py-1">
                <Text className="text-sm text-emerald-700">{COUPON} −20%</Text>
                <Text className="text-sm text-emerald-700">applied</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between border-t border-slate-300 pt-3">
          <Text className="text-base font-semibold text-slate-700">Total</Text>
          <View className="items-end">
            {discount > 0 ? (
              <Text className="text-xs text-slate-400 line-through">
                {money(START_PENCE)}
              </Text>
            ) : null}
            <Text
              className={`text-2xl font-extrabold ${
                total < WIN_UNDER_PENCE ? "text-emerald-600" : "text-slate-900"
              }`}
            >
              {money(total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Discount */}
      <Text className="mb-2 mt-6 text-base font-semibold text-slate-800">
        Apply your discount
      </Text>
      <View className="flex-row gap-2">
        <TextInput
          value={code}
          accessibilityLabel="Discount code"
          accessibilityHint="Enter the code from the training notification"
          onChangeText={setCode}
          placeholder="Enter code"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={apply}
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 font-mono text-[15px] text-slate-800"
        />
        <Pressable
          onPress={apply}
          accessibilityRole="button"
          accessibilityLabel="Apply discount code"
          className="min-h-12 flex-row items-center gap-1.5 rounded-xl bg-slate-900 px-5 active:bg-slate-700"
        >
          <Ionicons name="pricetag" size={15} color="#789f90" />
          <Text className="font-semibold text-white">Apply</Text>
        </Pressable>
      </View>

      {/* Prominent feedback banner */}
      {banner ? (
        <View
          accessibilityLiveRegion="polite"
          className={`mt-4 flex-row items-center gap-3 rounded-2xl p-4 ${
            banner.kind === "success" ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          <Ionicons
            name={
              banner.kind === "success" ? "checkmark-circle" : "alert-circle"
            }
            size={22}
            color={banner.kind === "success" ? "#526f62" : "#dc2626"}
          />
          <Text
            className={`flex-1 text-[15px] font-semibold ${
              banner.kind === "success" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {banner.text}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function CartLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-sm text-slate-600">{label}</Text>
      <Text className="text-sm font-medium text-slate-800">{value}</Text>
    </View>
  );
}

export const couponPuzzle: Puzzle = {
  id: "coupon",
  theme: "checkout",
  title: "Marginalia — discount",
  emoji: "🎟️",
  vulnName: "Business Logic Flaw",
  question: "Can you get the £30 order below £20?",
  initialUrl: "marginalia.test/checkout",
  editableUrl: false,
  hints: [
    "You used the offer once. Did anything actually stop you using it again?",
    "Watch the total each time you apply the same code.",
  ],
  successMessage: "🔓 Same code, stacked — your £30 order dropped under £20.",
  Site: CouponSite,
  reveal: {
    vulnName: "Business Logic Flaw",
    whatYouDid:
      "You applied the same discount several times. Nothing checked that you'd already used it, so it stacked.",
    whyItExists:
      "The site validated that the code was real, but not whether it had already been redeemed — a gap in the rules of how the feature is meant to work, not a broken login.",
    whyDangerous:
      "Near-free orders at scale; promotional budgets drained; real revenue loss that looks like ordinary traffic.",
    howToPrevent:
      "Enforce one-use-per-account on the server and record every redemption. Recompute the final total server-side before charging.",
    realIncident:
      "Stripe: a one-time $20,000 fee discount could be accepted again by sending many requests at once. A researcher responsibly repeated it 30 times on his own account, demonstrating $600,000 in fee-free processing. Stripe fixed the race condition.",
  },
};
