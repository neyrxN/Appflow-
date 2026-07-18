import type { Puzzle } from "./types";
import { idorPuzzle } from "./idor";
import { otpPuzzle } from "./otp";
import { pricePuzzle } from "./price";
import { couponPuzzle } from "./coupon";
import { adminPuzzle } from "./admin";

// The five puzzles, in demo order (IDOR opens).
export const puzzles: Puzzle[] = [
  idorPuzzle,
  otpPuzzle,
  pricePuzzle,
  couponPuzzle,
  adminPuzzle,
];

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}
