export type CaseMeta = {
  topic: string;
  difficulty: "Starter" | "Easy" | "Medium";
  duration: string;
};

const CASE_META: Record<string, CaseMeta> = {
  idor: {
    topic: "Private orders",
    difficulty: "Starter",
    duration: "3 min",
  },
  otp: {
    topic: "Sign-in codes",
    difficulty: "Easy",
    duration: "4 min",
  },
  price: {
    topic: "Online checkout",
    difficulty: "Medium",
    duration: "5 min",
  },
  coupon: {
    topic: "Discount rules",
    difficulty: "Easy",
    duration: "3 min",
  },
  admin: {
    topic: "Staff-only pages",
    difficulty: "Starter",
    duration: "3 min",
  },
};

const FALLBACK_META: CaseMeta = {
  topic: "Digital safety",
  difficulty: "Easy",
  duration: "4 min",
};

export function getCaseMeta(id: string): CaseMeta {
  return CASE_META[id] ?? FALLBACK_META;
}
