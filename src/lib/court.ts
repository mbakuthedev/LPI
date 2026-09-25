import type { CourtLookup } from "../types";
import { todayIso } from "./format";

const KNOWN: Record<string, Omit<CourtLookup, "system" | "retrievedAt" | "stub">> = {
  "LD/1234/2026": {
    caseNumber: "LD/1234/2026",
    suit: "Adeyemi v Adeyemi",
    court: "High Court of Lagos State",
    division: "Ikeja — Family Division",
    status: "Part-heard",
    nextHearing: "2026-10-02",
    parties: "Ngozi Adeyemi (Petitioner) · Kunle Adeyemi (Respondent)",
    filings: [
      "Petition for dissolution filed 12 Jan 2026",
      "Answer and cross-petition filed 3 Feb 2026",
      "Hearing notice issued 18 Sep 2026",
    ],
  },
  "LD/8841/2026": {
    caseNumber: "LD/8841/2026",
    suit: "Harbourline Logistics Ltd v Apex Terminals Ltd",
    court: "High Court of Lagos State",
    division: "Lagos — Commercial Division",
    status: "Pending",
    nextHearing: "2026-10-14",
    parties: "Harbourline Logistics Ltd (Claimant) · Apex Terminals Ltd (Defendant)",
    filings: ["Writ of summons filed 4 Mar 2026", "Memorandum of appearance filed 21 Mar 2026"],
  },
};

export function lookupCourt(
  system: CourtLookup["system"],
  caseNumber: string,
): CourtLookup {
  const key = caseNumber.trim().toUpperCase();
  const known = KNOWN[key];
  const retrievedAt = todayIso();

  if (known) {
    return { ...known, system, retrievedAt, stub: true };
  }

  const label = system === "comis" ? "Lagos CoMiS" : "Lagos State Judiciary";
  return {
    system,
    caseNumber: caseNumber.trim() || "—",
    suit: `Unindexed matter (${label} stub)`,
    court: system === "comis" ? "High Court of Lagos State" : "Court of Appeal, Lagos",
    division: system === "comis" ? "Registry search — no live docket" : "Civil Division (demo)",
    status: "No live record — stub response",
    nextHearing: "",
    parties: "Parties not returned by stub endpoint",
    filings: [
      `${label} accepted the case number but returned no live filings.`,
      "Wire the production endpoint when credentials are available.",
    ],
    retrievedAt,
    stub: true,
  };
}
