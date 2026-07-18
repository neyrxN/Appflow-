import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GameCtx, NetworkRequest, Puzzle } from "@/puzzles/types";

const EXPECTED = "739204";

const REQ_HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: "Bearer sess_5f21c…9d",
  origin: "https://nimbuseats.test",
};

// The server foolishly returned the expected code to the browser. A player who
// opens Developer Tools → Network can read it out of the send-code response,
// which sits among ordinary-looking sibling requests.
const REQUESTS: NetworkRequest[] = [
  {
    method: "GET",
    path: "/api/account/profile",
    status: 200,
    type: "fetch",
    size: "486 B",
    time: "94 ms",
    reqHeaders: REQ_HEADERS,
    response: {
      accountId: "acc_5521a0",
      name: "Alex Rivera",
      email: "alex.rivera@mailbox.test",
      phoneMasked: "+44 •••• 4821",
      memberSince: "2021-03-08",
    },
  },
  {
    method: "POST",
    path: "/api/auth/send-code",
    status: 200,
    type: "fetch",
    size: "512 B",
    time: "163 ms",
    reqHeaders: REQ_HEADERS,
    response: {
      challengeId: "ch_84df21",
      accountName: "Alex Rivera",
      phoneMasked: "+44 •••• 4821",
      channel: "sms",
      expiresIn: 300,
      verificationCode: EXPECTED,
    },
  },
  {
    method: "POST",
    path: "/collect?v=2&tid=NE-77",
    status: 200,
    type: "xhr",
    size: "0 B",
    time: "41 ms",
    response: { ok: true },
  },
  {
    method: "GET",
    path: "/static/js/verify.9c2a.js",
    status: 200,
    type: "script",
    size: "72 kB",
    time: "188 ms",
    responseNote: "Binary content (application/javascript · 72 kB)",
  },
  {
    method: "GET",
    path: "/assets/logo.png",
    status: 200,
    type: "png",
    size: "4.2 kB",
    time: "60 ms",
    responseNote: "Binary content (image/png · 4.2 kB)",
  },
];

type Phase = "idle" | "checking" | "success";

function OtpSite({ game }: { game: GameCtx }) {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    gameRef.current.setNetwork(REQUESTS);
    return () => gameRef.current.setNetwork(null);
  }, []);

  function verify() {
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setPhase("checking");
    setTimeout(() => {
      if (code === EXPECTED) {
        setPhase("success");
        gameRef.current.win();
      } else {
        setPhase("idle");
        setError("That code isn't right. Check and try again.");
      }
    }, 650);
  }

  function resend() {
    setResent(true);
    setError(null);
    setTimeout(() => setResent(false), 2200);
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-10 mt-2 flex-row items-center gap-2">
        <Text className="text-2xl">🥡</Text>
        <Text className="text-xl font-extrabold text-white">Nimbus Eats</Text>
      </View>

      <View className="items-center">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
          <Ionicons name="shield-checkmark" size={30} color="#22e07a" />
        </View>

        {phase === "success" ? (
          <View className="w-full items-center rounded-2xl bg-slate-900 p-8">
            <Ionicons name="lock-open" size={30} color="#22e07a" />
            <Text className="mt-3 text-center text-base font-bold text-white">
              You&apos;re in.
            </Text>
            <Text className="mt-1 text-center text-sm text-slate-400">
              Signed in to Alex Rivera&apos;s account.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mb-1 text-center text-lg font-bold text-white">
              Verify your identity
            </Text>
            <Text className="mb-7 text-center text-sm leading-5 text-slate-400">
              We sent a 6-digit code to the phone number on file,{"\n"}
              <Text className="font-semibold text-slate-200">
                +44 •••• 4821
              </Text>
              . Enter it to continue.
            </Text>

            <TextInput
              value={code}
              onChangeText={(t) => {
                setCode(t.replace(/[^0-9]/g, "").slice(0, 6));
                setError(null);
              }}
              placeholder="000000"
              placeholderTextColor="#334155"
              keyboardType="number-pad"
              editable={phase !== "checking"}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-4 text-center font-mono text-2xl tracking-[10px] text-white"
            />

            {error ? (
              <Text className="mt-3 text-center text-sm text-red-400">
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={verify}
              disabled={phase === "checking"}
              className="mt-5 w-full flex-row items-center justify-center gap-2 rounded-xl bg-accent py-3.5 active:bg-accent-dark"
            >
              {phase === "checking" ? (
                <ActivityIndicator color="#0b0f14" />
              ) : (
                <Text className="font-bold text-ink">Verify</Text>
              )}
            </Pressable>

            <Pressable onPress={resend} className="mt-4 py-1">
              <Text className="text-sm text-slate-400">
                {resent ? "Code re-sent ✓" : "Didn't get a code? Resend"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

export const otpPuzzle: Puzzle = {
  id: "otp",
  theme: "delivery",
  title: "Nimbus Eats — sign-in",
  emoji: "🔐",
  vulnName: "Secret verified on the client",
  question: "Can you sign in as someone whose phone you don't have?",
  initialUrl: "nimbuseats.test/verify",
  editableUrl: false,
  hints: [
    "You can't see the text message — but the code still had to travel to your browser somehow.",
    "A browser's own tools can show every response the site sent back.",
  ],
  successMessage: "🔓 You read the code the server should never have sent you.",
  Site: OtpSite,
  reveal: {
    vulnName: "Secret verified on the client",
    whatYouDid:
      "You found the one-time code in the site's own network response and typed it in. The server sent the answer to your browser and trusted the browser to check it.",
    whyItExists:
      "Checking the code in the browser is easier to build — but anything sent to the client can be read by the client. The secret never should have left the server.",
    whyDangerous:
      "Two-factor authentication becomes useless; anyone can take over any account without ever touching the owner's phone.",
    howToPrevent:
      "Verify one-time codes on the server. Compare what the user types against a secret the browser never sees, and rate-limit attempts.",
    realIncident:
      "A recurring bug-bounty finding: apps that returned the OTP in the server's response to the browser, letting anyone bypass 2FA. (Swap in a vetted named case before the demo if you have one.)",
  },
};
