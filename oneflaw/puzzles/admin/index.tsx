import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GameCtx, Puzzle } from "@/puzzles/types";

type Route =
  | "account"
  | "profile"
  | "billing"
  | "classes"
  | "settings"
  | "admin"
  | "404";

const NAV: { route: Route; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { route: "account", label: "Account", icon: "home" },
  { route: "profile", label: "Profile", icon: "person" },
  { route: "billing", label: "Billing", icon: "card" },
  { route: "classes", label: "My Classes", icon: "barbell" },
  { route: "settings", label: "Settings", icon: "settings" },
];

const KNOWN: Route[] = [
  "account",
  "profile",
  "billing",
  "classes",
  "settings",
  "admin",
];

// All fictional member data.
const MEMBERS = [
  { name: "Priya Anand", email: "priya.anand@mailbox.test", plan: "Premium", card: "•••• 4021" },
  { name: "Marcus Webb", email: "marcus.webb@mailbox.test", plan: "Standard", card: "•••• 7788" },
  { name: "Sarah Collins", email: "sarah.collins@mailbox.test", plan: "Premium", card: "•••• 1145" },
  { name: "Tom Becker", email: "tom.becker@mailbox.test", plan: "Standard", card: "•••• 9902" },
  { name: "Lena Fischer", email: "lena.fischer@mailbox.test", plan: "Premium", card: "•••• 3360" },
];

const CLASSES = [
  { name: "Spin & Sculpt", coach: "Dana Ortega", when: "Mon · 18:30", status: "Booked" },
  { name: "Power Yoga", coach: "Iris Kaminski", when: "Wed · 07:00", status: "Booked" },
  { name: "HIIT 45", coach: "Marco Bellini", when: "Thu · 19:15", status: "Waitlist" },
  { name: "Open Gym", coach: "Staffed", when: "Sat · 10:00", status: "Available" },
];

const INVOICES = [
  { id: "INV-2026-07", date: "12 Jul 2026", amount: "£39.00" },
  { id: "INV-2026-06", date: "12 Jun 2026", amount: "£39.00" },
  { id: "INV-2026-05", date: "12 May 2026", amount: "£39.00" },
];

function routeFrom(value: string): Route {
  const cleaned = value.trim().toLowerCase().replace(/\/+$/, "");
  const seg = cleaned.split("/").filter(Boolean).pop() ?? "";
  return (KNOWN as string[]).includes(seg) ? (seg as Route) : "404";
}

function AdminSite({ game }: { game: GameCtx }) {
  const [route, setRoute] = useState<Route>("account");

  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    gameRef.current.setResolver((value: string): string => {
      const r = routeFrom(value);
      setRoute(r);
      if (r === "admin") gameRef.current.win();
      return r === "404" ? `fitzone.test${normalizePath(value)}` : `fitzone.test/${r}`;
    });
    return () => gameRef.current.setResolver(null);
  }, []);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Site header */}
      <View className="flex-row items-center gap-2 px-5 pb-3 pt-4">
        <Text className="text-2xl">🏋️</Text>
        <Text className="text-xl font-extrabold text-white">FitZone</Text>
        <Text className="ml-auto text-sm text-slate-400">Alex Rivera</Text>
      </View>

      {/* Working nav menu (no link to /admin exists anywhere) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-12 border-b border-slate-800"
        contentContainerStyle={{ paddingHorizontal: 12, alignItems: "center", gap: 6 }}
      >
        {NAV.map((n) => {
          const active = route === n.route;
          return (
            <Pressable
              key={n.route}
              onPress={() => gameRef.current.navigate(`/${n.route}`)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${n.label}`}
              accessibilityState={{ selected: active }}
              className={`min-h-12 flex-row items-center gap-1.5 rounded-full px-4 ${
                active ? "bg-accent" : "bg-slate-800"
              }`}
            >
              <Ionicons
                name={n.icon}
                size={13}
                color={active ? "#0b0f14" : "#cbd5e1"}
              />
              <Text
                className={`text-xs font-semibold ${
                  active ? "text-ink" : "text-slate-200"
                }`}
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {route === "account" ? <AccountPage /> : null}
        {route === "profile" ? <ProfilePage /> : null}
        {route === "billing" ? <BillingPage /> : null}
        {route === "classes" ? <ClassesPage /> : null}
        {route === "settings" ? <SettingsPage /> : null}
        {route === "admin" ? <AdminPage /> : null}
        {route === "404" ? <NotFoundPage /> : null}
      </ScrollView>
    </View>
  );
}

function normalizePath(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/\/+$/, "");
  const seg = cleaned.split("/").filter(Boolean).pop() ?? "";
  return seg && !seg.includes(".") ? `/${seg}` : "";
}

/* ---------- Pages ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return <View className="mb-4 rounded-2xl bg-slate-800 p-5">{children}</View>;
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="ml-4 flex-1 text-right text-sm font-medium text-slate-100">
        {value}
      </Text>
    </View>
  );
}

function AccountPage() {
  return (
    <>
      <View className="mb-4 rounded-2xl border border-slate-700 bg-slate-800 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-[#9fb7aa]">
          Welcome back
        </Text>
        <Text className="mt-1 text-lg font-bold text-white">Alex Rivera</Text>
        <Text className="mt-4 text-sm text-slate-300">Premium · Active</Text>
      </View>
      <Card>
        <Text className="mb-1 text-sm font-semibold text-slate-300">
          Next class
        </Text>
        <Text className="text-base font-bold text-white">
          Spin & Sculpt — Mon 18:30
        </Text>
        <Text className="mt-1 text-sm text-slate-400">with Dana Ortega</Text>
      </Card>
      <Card>
        <KV label="Membership" value="Premium" />
        <KV label="Member since" value="Mar 2021" />
        <KV label="Home gym" value="FitZone Central" />
      </Card>
    </>
  );
}

function ProfilePage() {
  return (
    <Card>
      <Text className="mb-3 text-base font-bold text-white">Profile</Text>
      <KV label="Full name" value="Alex Rivera" />
      <KV label="Email" value="alex.rivera@mailbox.test" />
      <KV label="Phone" value="+44 •••• 4821" />
      <KV label="Membership" value="Premium" />
      <KV label="Preferred coach" value="Dana Ortega" />
      <KV label="Goals" value="Strength · Mobility" />
    </Card>
  );
}

function BillingPage() {
  return (
    <>
      <Card>
        <Text className="mb-3 text-base font-bold text-white">
          Payment method
        </Text>
        <KV label="Card" value="Visa •••• 4242" />
        <KV label="Membership" value="£39.00 / month" />
        <KV label="Next billing date" value="12 Aug 2026" />
      </Card>
      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Recent invoices
      </Text>
      <View className="rounded-2xl bg-slate-800">
        {INVOICES.map((inv, i) => (
          <View
            key={inv.id}
            className={`flex-row items-center justify-between px-4 py-3 ${
              i === INVOICES.length - 1 ? "" : "border-b border-slate-700"
            }`}
          >
            <View>
              <Text className="text-sm font-medium text-slate-100">{inv.id}</Text>
              <Text className="text-xs text-slate-500">{inv.date}</Text>
            </View>
            <Text className="text-sm font-semibold text-slate-200">
              {inv.amount}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function ClassesPage() {
  return (
    <>
      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Upcoming classes
      </Text>
      <View className="rounded-2xl bg-slate-800">
        {CLASSES.map((c, i) => (
          <View
            key={c.name}
            className={`px-4 py-3.5 ${
              i === CLASSES.length - 1 ? "" : "border-b border-slate-700"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-slate-100">{c.name}</Text>
              <View
                className={`rounded-full px-2.5 py-0.5 ${
                  c.status === "Booked"
                    ? "bg-emerald-900"
                    : c.status === "Waitlist"
                      ? "bg-amber-900"
                      : "bg-slate-700"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    c.status === "Booked"
                      ? "text-emerald-300"
                      : c.status === "Waitlist"
                        ? "text-amber-300"
                        : "text-slate-300"
                  }`}
                >
                  {c.status}
                </Text>
              </View>
            </View>
            <Text className="mt-0.5 text-xs text-slate-500">
              {c.when} · {c.coach}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function SettingsPage() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  return (
    <>
      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Notifications
      </Text>
      <View className="mb-4 rounded-2xl bg-slate-800">
        <ToggleRow label="Email updates" value={email} onChange={setEmail} />
        <ToggleRow label="Push notifications" value={push} onChange={setPush} />
        <ToggleRow label="SMS reminders" value={sms} onChange={setSms} last />
      </View>
      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Privacy
      </Text>
      <View className="mb-4 rounded-2xl bg-slate-800">
        <ToggleRow
          label="Show my profile to other members"
          value={publicProfile}
          onChange={setPublicProfile}
          last
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change password"
        className="min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 active:bg-slate-800"
      >
        <Ionicons name="key-outline" size={16} color="#e2e8f0" />
        <Text className="font-semibold text-slate-200">Change password</Text>
      </Pressable>
    </>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-slate-700"
      }`}
    >
      <Text className="flex-1 pr-4 text-[15px] text-slate-200">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: "#475569", true: "#789f90" }}
        thumbColor="#f8fafc"
      />
    </View>
  );
}

function AdminPage() {
  return (
    <>
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="server" size={15} color="#789f90" />
        <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
          Admin dashboard · all members
        </Text>
      </View>
      <View className="overflow-hidden rounded-2xl bg-slate-800">
        {MEMBERS.map((m, i) => (
          <View
            key={m.email}
            className={`px-4 py-3 ${
              i === MEMBERS.length - 1 ? "" : "border-b border-slate-700"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-slate-100">{m.name}</Text>
              <Text className="text-xs text-slate-400">{m.plan}</Text>
            </View>
            <Text className="mt-0.5 text-xs text-slate-500">
              {m.email} · {m.card}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function NotFoundPage() {
  return (
    <View className="items-center px-6 py-16">
      <Ionicons name="compass-outline" size={44} color="#475569" />
      <Text className="mt-4 text-lg font-bold text-white">
        404 — Page not found
      </Text>
      <Text className="mt-1 text-center text-sm text-slate-400">
        We couldn&apos;t find that page. Try a link from the menu above.
      </Text>
    </View>
  );
}

export const adminPuzzle: Puzzle = {
  id: "admin",
  theme: "gym",
  title: "FitZone — member area",
  emoji: "🗂️",
  vulnName: "Broken access control via forced browsing",
  question: "Can you find the staff-only page?",
  initialUrl: "fitzone.test/account",
  editableUrl: true,
  hints: [
    "Not every page is linked in the menu.",
    "What path might a website use for its administration area?",
  ],
  successMessage: "🔓 You reached a page that was never linked — or protected.",
  Site: AdminSite,
  reveal: {
    vulnName: "Broken access control via forced browsing",
    whatYouDid:
      "You typed the admin address directly. It was never linked from anywhere — but it also wasn't protected.",
    whyItExists:
      "The developer assumed 'if there's no link, nobody will find it.' Hiding a page is not the same as protecting it.",
    whyDangerous:
      "Anyone who guesses a common path (/admin, /dashboard) sees everyone's data — no login required.",
    howToPrevent:
      "Guard every sensitive page with a real server-side permission check. Obscurity is not security.",
    realIncident:
      "A.S. Watson, 2024: a researcher found an alternate shop API with little or no access control. It let him create an admin user and change promotional content without a proper sign-in. The flaw was reported through HackerOne and fixed within days.",
  },
};
