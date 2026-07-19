import AsyncStorage from "@react-native-async-storage/async-storage";

// Persistence is intentionally minimal. Solved puzzle IDs are kept ONLY in
// memory for the current session: completing a case shows a ✓ badge now, but
// reloading the app clears every badge and you start fresh. The first-run
// introduction flag is the one thing written to disk. No streaks, dates or
// scores.
const ONBOARDING_SEEN_KEY = "oneflaw:onboarding-seen";

// Session-scoped list of solved puzzle IDs. This module-level state resets on
// every app reload, which is exactly why the ✓ ticks disappear on restart.
let sessionSolved: string[] = [];

export async function getSolved(): Promise<string[]> {
  return [...sessionSolved];
}

export async function markSolved(id: string): Promise<string[]> {
  if (!sessionSolved.includes(id)) {
    sessionSolved = [...sessionSolved, id];
  }
  return [...sessionSolved];
}

export async function getOnboardingSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
  } catch {
    // Best-effort, like solved progress. Failure only replays onboarding later.
  }
}
