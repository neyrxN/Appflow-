import type { ComponentType } from "react";

/**
 * The teaching payload shown on the Reveal card once the player triggers the
 * one intentional flaw. Six required sections — every field is real, verified
 * copy (no placeholders ship on screen). Never shown before completion.
 */
export type RevealContent = {
  vulnName: string;
  whatYouDid: string;
  whyItExists: string;
  whyDangerous: string;
  howToPrevent: string;
  realIncident: string;
};

/**
 * A single row in the simulated browser's Developer Tools → Network panel.
 * Responses look like plausible application data, never tutorial text.
 */
export type NetworkRequest = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  /** Request kind shown in the Network list (fetch/xhr/script/png/document). */
  type?: string;
  /** Plausible transfer size, e.g. "1.4 kB". */
  size?: string;
  /** Plausible timing, e.g. "128 ms". */
  time?: string;
  /** Request headers shown under the Headers sub-tab. */
  reqHeaders?: Record<string, string>;
  /** JSON response body (any shape) — pretty-printed read-only. */
  response?: unknown;
  /** For non-JSON (binary/asset) responses, a short note instead of a body. */
  responseNote?: string;
  /**
   * When present, the whole request payload is editable as raw JSON and can be
   * re-sent (like Firefox DevTools "Edit and Resend"). `onResend` receives the
   * parsed edited body and returns the server's response to display.
   */
  editable?: {
    body: Record<string, unknown>;
    onResend: (parsed: Record<string, unknown>) => Record<string, unknown>;
  };
};

/** A phone-style push notification (distinct from the neutral Toast). */
export type NotificationConfig = { title: string; body: string };

/**
 * The context each puzzle's Site receives from the shared shell. The Site owns
 * its own website UI; the shell owns the browser chrome, URL history, Developer
 * Tools, notifications and the reveal flow.
 *
 * There is deliberately NO tries/score/timer here — exploration is unlimited.
 */
export type GameCtx = {
  solved: boolean;
  /** The current committed address-bar URL (owned by the shell's history). */
  url: string;
  /** Trigger the win → non-blocking success ribbon (+ success haptic). */
  win: () => void;
  /** Transient in-world feedback (e.g. a small toast). NOT a penalty. */
  note: (msg: string) => void;
  /** Commit a navigation (address-bar Go, or an in-page link). History-aware. */
  navigate: (url: string) => void;
  /**
   * URL-driven puzzles register a resolver: given a raw URL/route it updates
   * its own page state and returns the normalized URL to show + store. The
   * shell calls it on Go and on back/forward.
   */
  setResolver: (fn: ((url: string) => string) | null) => void;
  /** Register (or clear) the Developer Tools → Network requests. */
  setNetwork: (requests: NetworkRequest[] | null) => void;
  /** Reveal the next mission hint (e.g. after a non-winning attempt). */
  revealHint: () => void;
  /** Fire a phone-style push notification (slides in, auto-dismisses). */
  notify: (n: NotificationConfig) => void;
};

export type Puzzle = {
  id: string;
  /** Cosmetic theme label, e.g. "pizza". */
  theme: string;
  /** Neutral card title for the dashboard — must NOT name the vulnerability. */
  title: string;
  /** Shown only on the reveal, after completion. */
  vulnName: string;
  /** The big, bold mission question shown in the banner — ends in "?". */
  question: string;
  /** Emoji/icon shown on the dashboard card. */
  emoji: string;
  /** Initial address-bar contents. */
  initialUrl: string;
  /** When true the address pill is an editable input with a "Go" action. */
  editableUrl?: boolean;
  /**
   * Progressive nudges pointing at WHERE to look — never WHAT to type. No
   * codes, coupons, paths, or field names. Revealed one at a time via "Stuck?".
   */
  hints: string[];
  /** Inline, non-blocking ribbon text shown the moment the flaw fires. */
  successMessage?: string;
  /** The fake website body + its interactive controls. */
  Site: ComponentType<{ game: GameCtx }>;
  reveal: RevealContent;
};
