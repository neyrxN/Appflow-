import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Modal, Platform, View } from "react-native";
import * as Haptics from "expo-haptics";
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
  const successMessage =
    puzzle.successMessage ?? "🔓 Nice — you just broke it.";

  const showNote = useCallback((msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 1900);
  }, []);

  const win = useCallback(() => {
    setSolved((prev) => {
      if (prev) return prev;
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
      onSolved?.();
      setRibbonVisible(true);
      if (Platform.OS === "ios") {
        AccessibilityInfo.announceForAccessibility(successMessage);
      }
      return true;
    });
  }, [onSolved, successMessage]);

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
    }
  }, [history]);

  const goForward = useCallback(() => {
    if (idxRef.current < history.length - 1) {
      const i = idxRef.current + 1;
      idxRef.current = i;
      setIdx(i);
      resolverRef.current?.(history[i]);
    }
  }, [history]);

  const setResolver = useCallback((fn: ((url: string) => string) | null) => {
    resolverRef.current = fn;
  }, []);

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
  const modalOpen = devtoolsOpen || revealOpen;

  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
      if (notifTimer.current) clearTimeout(notifTimer.current);
    },
    [],
  );

  return (
    <View className="flex-1 bg-[#08090b]" style={{ paddingTop: insets.top }}>
      <View
        className="flex-1"
        accessibilityElementsHidden={modalOpen}
        importantForAccessibility={modalOpen ? "no-hide-descendants" : "auto"}
        aria-hidden={modalOpen}
      >
        <BrowserChrome
          url={url}
          editable={puzzle.editableUrl ?? false}
          onGo={navigate}
          onBack={goBack}
          onForward={goForward}
          canBack={idx > 0}
          canForward={idx < history.length - 1}
          onExit={onBack}
          onTools={() => {
            setNotifVisible(false);
            setDevtoolsOpen(true);
          }}
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
            message={successMessage}
            onExplain={openReveal}
            onDismiss={() => setRibbonVisible(false)}
          />
        ) : null}

        {solved && !ribbonVisible && !revealOpen ? (
          <ReopenPill onPress={() => setRevealOpen(true)} />
        ) : null}

        <PushNotification
          config={lastNotification}
          visible={notifVisible && !modalOpen}
          onDismiss={() => setNotifVisible(false)}
        />
      </View>

      {devtoolsOpen ? (
        <Modal
          transparent
          statusBarTranslucent
          animationType="none"
          presentationStyle="overFullScreen"
          onRequestClose={() => setDevtoolsOpen(false)}
        >
          <DevToolsPanel
            requests={network ?? []}
            onClose={() => setDevtoolsOpen(false)}
          />
        </Modal>
      ) : null}

      {revealOpen ? (
        <Modal
          transparent
          statusBarTranslucent
          animationType="none"
          presentationStyle="overFullScreen"
          onRequestClose={() => setRevealOpen(false)}
        >
          <RevealCard
            visible
            reveal={puzzle.reveal}
            onClose={() => setRevealOpen(false)}
          />
        </Modal>
      ) : null}
    </View>
  );
}
