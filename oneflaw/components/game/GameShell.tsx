import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type {
  GameCtx,
  NetworkRequest,
  NotificationConfig,
  Puzzle,
} from "@/puzzles/types";
import { BrowserChrome } from "./BrowserChrome";
import { GoalBanner } from "./GoalBanner";
import { RevealCard } from "./RevealCard";
import { Toast } from "./Toast";
import { ReopenPill, SuccessRibbon } from "./SuccessRibbon";
import { DevToolsPanel } from "./DevToolsPanel";
import { PushNotification } from "./PushNotification";

const NOTIF_MS = 4200;

export function GameShell({
  puzzle,
  onBack,
  onSolved,
}: {
  puzzle: Puzzle;
  onBack: () => void;
  onSolved?: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Address-bar history so back/forward move both the page and the URL.
  const [history, setHistory] = useState<string[]>([puzzle.initialUrl]);
  const [idx, setIdx] = useState(0);
  const url = history[idx];

  const [solved, setSolved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [ribbonVisible, setRibbonVisible] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [network, setNetworkState] = useState<NetworkRequest[] | null>(null);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  const [lastNotification, setLastNotification] =
    useState<NotificationConfig | null>(null);
  const [notifVisible, setNotifVisible] = useState(false);

  const resolverRef = useRef<((url: string) => string) | null>(null);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNote = useCallback((msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 1900);
  }, []);

  const win = useCallback(() => {
    setSolved((prev) => {
      if (prev) return prev;
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      onSolved?.();
      setRibbonVisible(true);
      return true;
    });
  }, [onSolved]);

  // Commit a navigation: ask the puzzle to resolve/render, store the result.
  const navigate = useCallback((raw: string) => {
    const norm = resolverRef.current ? resolverRef.current(raw) : raw;
    const i = idxRef.current;
    setHistory((h) => [...h.slice(0, i + 1), norm]);
    const nextIdx = i + 1;
    idxRef.current = nextIdx;
    setIdx(nextIdx);
  }, []);

  const goBack = useCallback(() => {
    if (idxRef.current > 0) {
      const i = idxRef.current - 1;
      idxRef.current = i;
      setIdx(i);
      resolverRef.current?.(history[i]);
    } else {
      onBack();
    }
  }, [history, onBack]);

  const goForward = useCallback(() => {
    if (idxRef.current < history.length - 1) {
      const i = idxRef.current + 1;
      idxRef.current = i;
      setIdx(i);
      resolverRef.current?.(history[i]);
    }
  }, [history]);

  const setResolver = useCallback(
    (fn: ((url: string) => string) | null) => {
      resolverRef.current = fn;
    },
    [],
  );

  const setNetwork = useCallback((reqs: NetworkRequest[] | null) => {
    setNetworkState(reqs);
  }, []);

  const hintCount = puzzle.hints.length;
  const revealHint = useCallback(() => {
    setHintsShown((n) => Math.min(hintCount, n === 0 ? 1 : n + 1));
  }, [hintCount]);

  const showNotification = useCallback((n: NotificationConfig) => {
    setLastNotification(n);
    setNotifVisible(true);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotifVisible(false), NOTIF_MS);
  }, []);

  const game = useMemo<GameCtx>(
    () => ({
      solved,
      url,
      win,
      note: showNote,
      navigate,
      setResolver,
      setNetwork,
      revealHint,
      notify: showNotification,
    }),
    [
      solved,
      url,
      win,
      showNote,
      navigate,
      setResolver,
      setNetwork,
      revealHint,
      showNotification,
    ],
  );

  const openReveal = useCallback(() => {
    setRibbonVisible(false);
    setRevealOpen(true);
  }, []);

  const Site = puzzle.Site;

  return (
    <View className="flex-1 bg-slate-950" style={{ paddingTop: insets.top }}>
      <BrowserChrome
        url={url}
        editable={puzzle.editableUrl ?? false}
        onGo={navigate}
        onBack={goBack}
        onForward={goForward}
        canForward={idx < history.length - 1}
        onMenu={() => setMenuOpen(true)}
        showBell={!!lastNotification}
        onBell={() => showNotification(lastNotification!)}
      />
      <GoalBanner
        question={puzzle.question}
        hints={puzzle.hints}
        shown={hintsShown}
        onToggle={() => setHintsShown((n) => (n === 0 ? 1 : 0))}
        onMore={() => setHintsShown((n) => Math.min(hintCount, n + 1))}
      />

      <View className="flex-1">
        <Site game={game} />
      </View>

      {note ? <Toast message={note} /> : null}

      {solved && ribbonVisible ? (
        <SuccessRibbon
          message={puzzle.successMessage ?? "🔓 Nice — you just broke it."}
          onExplain={openReveal}
          onDismiss={() => setRibbonVisible(false)}
        />
      ) : null}

      {solved && !ribbonVisible && !revealOpen ? (
        <ReopenPill onPress={() => setRevealOpen(true)} />
      ) : null}

      <PushNotification
        config={lastNotification}
        visible={notifVisible}
        onDismiss={() => setNotifVisible(false)}
      />

      {/* ⋮ browser menu */}
      {menuOpen ? (
        <View className="absolute inset-0" style={{ zIndex: 25 }}>
          <Pressable
            className="absolute inset-0"
            onPress={() => setMenuOpen(false)}
          />
          <View
            style={{ top: insets.top + 48 }}
            className="absolute right-2 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg"
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                setDevtoolsOpen(true);
              }}
              className="flex-row items-center gap-3 border-b border-slate-700 px-4 py-3 active:bg-slate-700"
            >
              <Ionicons name="build-outline" size={17} color="#e2e8f0" />
              <Text className="text-[15px] text-slate-100">Developer Tools</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onBack();
              }}
              className="flex-row items-center gap-3 px-4 py-3 active:bg-slate-700"
            >
              <Ionicons name="exit-outline" size={17} color="#e2e8f0" />
              <Text className="text-[15px] text-slate-100">Exit to OneFlaw</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {devtoolsOpen ? (
        <DevToolsPanel
          requests={network ?? []}
          onClose={() => setDevtoolsOpen(false)}
        />
      ) : null}

      <RevealCard
        visible={revealOpen}
        reveal={puzzle.reveal}
        onClose={() => setRevealOpen(false)}
      />
    </View>
  );
}
