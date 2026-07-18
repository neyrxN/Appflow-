import AsyncStorage from "@react-native-async-storage/async-storage";

// Local persistence is intentionally small: solved puzzle IDs plus whether the
// player has dismissed the first-run introduction. No streaks, dates or scores.
const SOLVED_KEY = "oneflaw:solved";
const ONBOARDING_SEEN_KEY = "oneflaw:onboarding-seen";

export async function getSolved(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SOLVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function markSolved(id: string): Promise<string[]> {
  const current = await getSolved();
  if (current.includes(id)) return current;
  const next = [...current, id];
  try {
    await AsyncStorage.setItem(SOLVED_KEY, JSON.stringify(next));
  } catch {
    // best-effort; a failed write just means no ✓ badge this session
  }
  return next;
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
