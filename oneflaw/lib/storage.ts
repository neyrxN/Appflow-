import AsyncStorage from "@react-native-async-storage/async-storage";

// The ONLY persistence in the app: which puzzles the player has solved, so the
// dashboard can show a ✓. No streaks, no dates, no scores.
const SOLVED_KEY = "oneflaw:solved";

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
