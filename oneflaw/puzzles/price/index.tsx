import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GameCtx, NetworkRequest, Puzzle } from "@/puzzles/types";

const UNIT_CENTS = 15900; // €159.00
const SHIP_CENTS = 599; // €5.99
const REAL_TOTAL_CENTS = UNIT_CENTS + SHIP_CENTS; // 16499

const euros = (cents: number) => `€${(cents / 100).toFixed(2)}`;

function PriceSite({ game }: { game: GameCtx }) {
  const [charged, setCharged] = useState<number | null>(null);

  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    // The checkout request the browser is about to send. The fake server trusts
    // ONLY `total_cents` — it recomputes nothing — which is the whole lesson.
    const checkout: NetworkRequest = {
      method: "POST",
      path: "/api/checkout",
      status: 200,
      type: "fetch",
      size: "1.1 kB",
      time: "142 ms",
      reqHeaders: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Bearer sess_9f2c…a1",
        origin: "https://sole.test",
      },
      editable: {
        body: {
          cart: [
            {
              sku: "AUR-RUN-SF-9",
              name: "Aurora Runner — Solar Flare",
              size: "US 9",
              qty: 1,
              unit_price_cents: UNIT_CENTS,
              currency: "EUR",
            },
          ],
          subtotal_cents: UNIT_CENTS,
          shipping_cents: SHIP_CENTS,
          discount_cents: 0,
          total_cents: REAL_TOTAL_CENTS,
        },
        onResend: (parsed) => {
          // Server charges whatever total_cents says; recomputes nothing else.
          const raw = Number((parsed as { total_cents?: unknown }).total_cents);
          const total = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : REAL_TOTAL_CENTS;
          setCharged(total);
          if (total < REAL_TOTAL_CENTS) {
            gameRef.current.win();
          } else {
            // A non-winning tamper (e.g. only qty/price changed): nudge a hint.
            gameRef.current.revealHint();
          }
          return {
            status: "confirmed",
            order_id: "ord_7c1a94",
            charged_cents: total,
            currency: "EUR",
          };
        },
      },
    };

    gameRef.current.setNetwork([
      {
        method: "GET",
        path: "/api/cart",
        status: 200,
        type: "fetch",
        size: "612 B",
        time: "88 ms",
        response: {
          item: "Aurora Runner — Solar Flare",
          size: "US 9",
          qty: 1,
          unit_price_cents: UNIT_CENTS,
          shipping_cents: SHIP_CENTS,
        },
      },
      checkout,
      {
        method: "POST",
        path: "/collect?id=SOLE-A1",
        status: 200,
        type: "xhr",
        size: "0 B",
        time: "37 ms",
        response: { ok: true },
      },
      {
        method: "GET",
        path: "/static/js/app.4f1c.js",
        status: 200,
        type: "script",
        size: "184 kB",
        time: "210 ms",
        responseNote: "Binary content (application/javascript · 184 kB)",
      },
      {
        method: "GET",
        path: "/img/aurora-runner.png",
        status: 200,
        type: "png",
        size: "96 kB",
        time: "121 ms",
        responseNote: "Binary content (image/png · 96 kB)",
      },
    ]);
    return () => gameRef.current.setNetwork(null);
  }, []);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-5 flex-row items-center gap-2">
        <Text className="text-2xl">👟</Text>
        <Text className="text-xl font-extrabold tracking-tight text-slate-900">
          SOLE
        </Text>
        <Text className="ml-auto text-sm text-slate-500">Checkout</Text>
      </View>

      {/* Hero product */}
      <View className="overflow-hidden rounded-2xl border border-slate-200">
        <View className="h-40 items-center justify-center bg-orange-500">
          <Text className="text-6xl">👟</Text>
          <View className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1">
            <Text className="text-[11px] font-bold text-white">
              SOLD OUT elsewhere · 1 left
            </Text>
          </View>
        </View>
        <View className="p-4">
          <Text className="text-base font-extrabold text-slate-900">
            Aurora Runner — Solar Flare
          </Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            Limited drop · Size US 9
          </Text>
        </View>
      </View>

      {/* Totals */}
      <View className="mt-5 rounded-2xl border border-slate-200 p-4">
        <SummaryRow label="Subtotal" value={euros(UNIT_CENTS)} />
        <SummaryRow label="Shipping" value={euros(SHIP_CENTS)} />
        <SummaryRow label="Discount" value={euros(0)} />
        <View className="mt-2 flex-row items-center justify-between border-t border-slate-200 pt-3">
          <Text className="text-base font-semibold text-slate-700">Total</Text>
          <Text className="text-2xl font-extrabold text-slate-900">
            {charged === null ? euros(REAL_TOTAL_CENTS) : euros(charged)}
          </Text>
        </View>
      </View>

      {charged !== null ? (
        <View className="mt-6 flex-row items-center gap-2 rounded-2xl bg-emerald-50 p-4">
          <Ionicons name="checkmark-circle" size={22} color="#526f62" />
          <Text className="flex-1 font-semibold text-emerald-700">
            Order confirmed — you paid {euros(charged)}. Your Aurora Runners are
            on the way!
          </Text>
        </View>
      ) : (
        <View className="mt-6 flex-row items-center gap-2 rounded-2xl bg-slate-100 p-4">
          <Ionicons name="lock-closed" size={16} color="#64748b" />
          <Text className="flex-1 text-sm text-slate-500">
            Secure checkout · you&apos;ll be charged {euros(REAL_TOTAL_CENTS)}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-slate-600">{label}</Text>
      <Text className="text-sm font-medium text-slate-800">{value}</Text>
    </View>
  );
}

export const pricePuzzle: Puzzle = {
  id: "price",
  theme: "shop",
  title: "SOLE — sneaker drop",
  emoji: "👟",
  vulnName: "Trusting client-side input",
  question: "Can you decide your own price at checkout?",
  initialUrl: "sole.test/checkout",
  editableUrl: false,
  hints: [
    "The price is worked out in your browser before it's sent to the shop.",
    "A browser's own tools can show — and change — the request before it leaves.",
    "The shop only reads one field from what you send. Which one is the price it charges?",
  ],
  successMessage: "🔓 You set your own price — and the shop accepted it.",
  Site: PriceSite,
  reveal: {
    vulnName: "Trusting client-side input",
    whatYouDid:
      "You edited the order your own browser was about to send. The shop charged the total you handed it — it never recalculated the real price.",
    whyItExists:
      "Changing the size or quantity did nothing, because the server only ever trusted one field: the final total. It recomputed none of them.",
    whyDangerous:
      "Attackers buy anything for any price — straight fraud, at scale, that looks like an ordinary order.",
    howToPrevent:
      "Recompute every price and total on the server from trusted data. Treat all input from the browser as untrusted.",
    realIncident:
      "ShopFactory, 2002: some online carts stored product prices inside a browser cookie. A customer could edit that cookie, and the changed price stayed through billing. The vendor said it knew of no fraud, but warned customers and offered a partial fix.",
  },
};
