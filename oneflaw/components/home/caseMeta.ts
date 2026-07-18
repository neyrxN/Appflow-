export type CaseMeta = {
  appName: string;
  caseName: string;
  topic: string;
  difficulty: "Starter" | "Easy" | "Medium";
  duration: string;
};

const CASE_META: Record<string, CaseMeta> = {
  idor: {
    appName: "Slice & Co.",
    caseName: "The wrong order",
    topic: "Private orders",
    difficulty: "Starter",
    duration: "3 min",
  },
  otp: {
    appName: "Nimbus Eats",
    caseName: "Code breaker",
    topic: "Sign-in codes",
    difficulty: "Easy",
    duration: "4 min",
  },
  price: {
    appName: "SOLE",
    caseName: "Name your price",
    topic: "Online checkout",
    difficulty: "Medium",
    duration: "5 min",
  },
  coupon: {
    appName: "Slice & Co.",
    caseName: "Coupon stack",
    topic: "Discount rules",
    difficulty: "Easy",
    duration: "3 min",
  },
  admin: {
    appName: "FitZone",
    caseName: "Hidden admin",
    topic: "Staff-only pages",
    difficulty: "Starter",
    duration: "3 min",
  },
};

const FALLBACK_META: CaseMeta = {
  appName: "OneFlaw",
  caseName: "Mystery case",
  topic: "Digital safety",
  difficulty: "Easy",
  duration: "4 min",
};

export function getCaseMeta(id: string): CaseMeta {
  return CASE_META[id] ?? FALLBACK_META;
}
