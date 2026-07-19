import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GameCtx, Puzzle } from "@/puzzles/types";

const MY_ID = 1042; // orders 1..1042 exist "so far"; 1042 is you

// All fictional — no real people, orders, or addresses.
const FIRST = ["Priya", "Marcus", "Sarah", "Tomaz", "Lena", "Ahmed", "Ivan", "Chloe", "Nadia", "Ben", "Ula", "Rok", "Elena", "Sam", "Kofi", "Maja"];
const LAST = ["Anand", "Webb", "Collins", "Novak", "Fischer", "Khan", "Petrov", "Reid", "Haddad", "Cole", "Kovac", "Doric", "Marsh", "Owens", "Mensah", "Zupan"];
const ITEMS = ["Large Pepperoni", "Veggie Supreme (Medium)", "Meat Feast (Large) ×2", "Margherita + Garlic Bread", "Hawaiian (Large)", "Four Cheese (Medium)", "BBQ Chicken + Wings"];
const CITY = ["Bristol", "Leeds", "Manchester", "Cardiff", "Bath", "Sheffield", "Derby", "Hull", "York", "Luton"];
const STAT = ["Delivered", "Out for delivery", "Preparing", "Cancelled"];

type Order = {
  customer: string;
  item: string;
  price: string;
  address: string;
  status: string;
  isYou?: boolean;
};

/**
 * Deterministic generator: ANY valid order number returns a distinct,
 * plausible order. That's what makes the "I can see EVERYONE" lesson land.
 */
export function getOrder(n: number): Order | null {
  if (!Number.isInteger(n) || n < 1 || n > MY_ID) return null;
  if (n === MY_ID) {
    return {
      customer: "Joseph (you)",
      item: "Large Pepperoni",
      price: "£24.99",
      address: "14 Oak Street, Manchester",
      status: "Preparing",
      isYou: true,
    };
  }
  const spread = Math.abs(Math.sin(n) * 9973); // cheap deterministic spread
  const pick = (arr: string[], k: number) =>
    arr[Math.floor(spread * k) % arr.length];
  const price = (8 + ((n * 37) % 3500) / 100).toFixed(2);
  return {
    customer: `${pick(FIRST, 3)} ${pick(LAST, 7)}`,
    item: pick(ITEMS, 5),
    price: `£${price}`,
    address: `${(n * 7) % 99} ${pick(LAST, 2)} Street, ${pick(CITY, 4)}`,
    status: pick(STAT, 1),
  };
}

function parseOrderId(value: string): number | null {
  const m = value.match(/orders\/(\d+)/) ?? value.match(/(\d+)\s*$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

function IdorSite({ game }: { game: GameCtx }) {
  const [orderId, setOrderId] = useState(MY_ID);
  const [notFound, setNotFound] = useState(false);
  const [badId, setBadId] = useState<number | null>(null);
  const order = getOrder(orderId)!;
  const isMine = !!order.isYou;

  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    gameRef.current.setResolver((value: string): string => {
      const g = gameRef.current;
      const n = parseOrderId(value);
      const found = n === null ? null : getOrder(n);
      if (n !== null && found) {
        setOrderId(n);
        setNotFound(false);
        if (!found.isYou) g.win(); // viewing anyone else's order is the flaw
        return `sliceandco.test/orders/${n}`;
      }
      // Believable not-found state; keep the puzzle usable.
      setNotFound(true);
      setBadId(n);
      return n !== null
        ? `sliceandco.test/orders/${n}`
        : "sliceandco.test/orders";
    });
    return () => gameRef.current.setResolver(null);
  }, []);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      {/* Fake site header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">🍕</Text>
          <Text className="text-xl font-extrabold text-slate-900">
            Slice & Co.
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="person-circle" size={20} color="#64748b" />
          <Text className="text-sm text-slate-500">Joseph</Text>
        </View>
      </View>

      {notFound ? (
        <View className="items-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12">
          <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
          <Text className="mt-3 text-base font-semibold text-slate-700">
            We couldn&apos;t find that order
          </Text>
          <Text className="mt-1 text-center text-sm text-slate-500">
            {badId !== null
              ? `Order #${badId} doesn't exist yet.`
              : "Check the order number and try again."}
          </Text>
        </View>
      ) : (
        <>
          <Text className="mb-3 text-sm font-medium text-slate-400">
            Order details
          </Text>

          <View className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">
                Order #{orderId}
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  isMine ? "bg-emerald-100" : "bg-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isMine ? "text-emerald-700" : "text-slate-600"
                  }`}
                >
                  {isMine ? "Your order" : "Account holder"}
                </Text>
              </View>
            </View>

            <Row label="Customer" value={order.customer} />
            <Row label="Item" value={order.item} />
            <Row label="Total" value={order.price} />
            <Row label="Deliver to" value={order.address} />
            <Row label="Status" value={order.status} last />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between py-2.5 ${
        last ? "" : "border-b border-slate-200"
      }`}
    >
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="ml-4 flex-1 text-right text-sm font-medium text-slate-800">
        {value}
      </Text>
    </View>
  );
}

export const idorPuzzle: Puzzle = {
  id: "idor",
  theme: "pizza",
  title: "Slice & Co. — order status",
  emoji: "🍕",
  vulnName: "Broken access control (IDOR)",
  question: "Can you read another order?",
  initialUrl: "sliceandco.test/orders/1042",
  editableUrl: true,
  hints: [
    "The web address ends in a number. What if it were a different one?",
    "You're order #1042. Try the orders right next to yours.",
  ],
  successMessage: "🔓 Access granted — you're viewing data that isn't yours.",
  Site: IdorSite,
  reveal: {
    vulnName: "Broken access control (IDOR)",
    whatYouDid:
      "You changed the number in the address and read a stranger's order. The site checked you were logged in — but never that this order was yours.",
    whyItExists:
      "Developers often check who you are but forget to check what you're allowed to see. The ID in the URL is a direct, guessable reference to someone else's record.",
    whyDangerous:
      "Anyone can page through every customer's data by counting — 1041, 1040, 7, 500 — with no tools beyond a web browser.",
    howToPrevent:
      "On every request, verify the logged-in user actually owns the record before returning it. Don't rely on IDs being secret.",
    realIncident:
      "Panera Bread, 2018: its website returned customer details without checking whether the visitor was signed in or allowed to see them. A researcher reported the flaw in August 2017, but it remained until public reporting in April 2018. Panera and researchers strongly disagreed about how many records were exposed.",
  },
};
