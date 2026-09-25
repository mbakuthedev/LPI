import type {
  InvoiceStatus,
  InvoiceType,
  LawyerRole,
  LineOfActionType,
  MatterStatus,
  PartyRole,
  PostHearingOutcome,
} from "../types";

export const ROLE_LABEL: Record<LawyerRole, string> = {
  partner: "Partner",
  associate: "Associate",
  counsel: "Counsel",
  paralegal: "Paralegal",
};

export const STATUS_LABEL: Record<MatterStatus, string> = {
  intake: "Intake",
  active: "Active",
  in_court: "In court",
  adr: "ADR",
  judgment: "Judgement",
  closed: "Closed",
};

export const ACTION_LABEL: Record<LineOfActionType, string> = {
  send_correspondence: "Send out correspondence",
  respond_correspondence: "Respond to correspondence",
  file_court_action: "File court action",
  respond_court_action: "Respond to court action",
  demand_letter: "Demand letter",
  court_memo: "Court memo",
  judgement: "Judgement",
  off_cycle_cost: "Off-cycle activity — cost",
};

export const ACTION_OPTIONS: LineOfActionType[] = [
  "send_correspondence",
  "respond_correspondence",
  "file_court_action",
  "respond_court_action",
  "demand_letter",
  "court_memo",
  "judgement",
  "off_cycle_cost",
];

export const OUTCOME_LABEL: Record<PostHearingOutcome, string> = {
  court_memo: "Court memo",
  hearing_notice: "Hearing notice",
  adjournment: "Adjournment",
  dispute_resolution: "Dispute resolution",
  arbitration: "Arbitration",
  signed_agreement: "Signed agreement",
  judgement: "Judgement",
};

export const OUTCOME_OPTIONS: PostHearingOutcome[] = [
  "court_memo",
  "hearing_notice",
  "adjournment",
  "dispute_resolution",
  "arbitration",
  "signed_agreement",
  "judgement",
];

export const PARTY_LABEL: Record<PartyRole, string> = {
  client: "Client",
  co_client: "Co-client",
  opposing_party: "Opposing party",
  opposing_counsel: "Opposing counsel",
  court: "Court",
  witness: "Witness",
};

export const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  sign_on: "Sign-on fee",
  appearance: "Court appearance",
  progress: "Progress bill",
  cost: "Disbursement / cost",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};
