import type { MatterCategory } from "../types";

export const SIGN_ON_FEES: Record<MatterCategory, number> = {
  divorce: 250_000,
  criminal: 300_000,
  business: 350_000,
  civil: 200_000,
};

export const APPEARANCE_FEE = 75_000;

export const CATEGORY_LABEL: Record<MatterCategory, string> = {
  divorce: "Divorce",
  criminal: "Criminal Matter",
  business: "Business Matter",
  civil: "Civil Dispute",
};

export const CATEGORY_OPTIONS: MatterCategory[] = [
  "divorce",
  "criminal",
  "business",
  "civil",
];
