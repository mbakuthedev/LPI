export type MatterCategory = "divorce" | "criminal" | "business" | "civil";

export type LawyerRole = "partner" | "associate" | "counsel" | "paralegal";

export type MatterStatus =
  | "intake"
  | "active"
  | "in_court"
  | "adr"
  | "judgment"
  | "closed";

export type LineOfActionType =
  | "send_correspondence"
  | "respond_correspondence"
  | "file_court_action"
  | "respond_court_action"
  | "demand_letter"
  | "court_memo"
  | "judgement"
  | "off_cycle_cost";

export type PostHearingOutcome =
  | "court_memo"
  | "hearing_notice"
  | "adjournment"
  | "dispute_resolution"
  | "arbitration"
  | "signed_agreement"
  | "judgement";

export type PartyRole =
  | "client"
  | "co_client"
  | "opposing_party"
  | "opposing_counsel"
  | "court"
  | "witness";

export type InvoiceType = "sign_on" | "appearance" | "progress" | "cost";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type DocumentSource = "upload" | "url";
export type CommChannel = "email" | "call" | "visit" | "note";

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: LawyerRole;
  practiceAreas: MatterCategory[];
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Party {
  id: string;
  role: PartyRole;
  name: string;
  email: string;
  phone: string;
}

export interface Matter {
  id: string;
  clientId: string;
  category: MatterCategory;
  title: string;
  assignedLawyerId: string;
  conflictCleared: boolean;
  engagementAcknowledged: boolean;
  memo: string;
  minutes: string;
  actionPoints: string;
  courtCaseNumber: string;
  status: MatterStatus;
  parties: Party[];
  createdAt: string;
}

export interface MatterDocument {
  id: string;
  matterId: string;
  name: string;
  kind: string;
  source: DocumentSource;
  url: string;
  sizeLabel: string;
  uploadedAt: string;
}

export interface MatterAction {
  id: string;
  matterId: string;
  type: LineOfActionType;
  notes: string;
  documentId: string;
  emailOtherParty: boolean;
  otherPartyEmail: string;
  cost: number;
  createdAt: string;
}

export interface Hearing {
  id: string;
  matterId: string;
  date: string;
  time: string;
  court: string;
  memo: string;
  hearingNotice: string;
  reminderSent: boolean;
  outcome: PostHearingOutcome | "";
  outcomeNotes: string;
  nextDate: string;
  invoiceId: string;
}

export interface Invoice {
  id: string;
  matterId: string;
  clientId: string;
  type: InvoiceType;
  description: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt: string;
  emailedTo: string;
}

export interface Communication {
  id: string;
  matterId: string;
  channel: CommChannel;
  subject: string;
  body: string;
  at: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
}

export interface CourtLookup {
  system: "comis" | "judiciary";
  caseNumber: string;
  suit: string;
  court: string;
  division: string;
  status: string;
  nextHearing: string;
  parties: string;
  filings: string[];
  retrievedAt: string;
  stub: true;
}

export interface Notice {
  id: string;
  message: string;
}

export interface AppState {
  lawyers: Lawyer[];
  clients: Client[];
  matters: Matter[];
  documents: MatterDocument[];
  actions: MatterAction[];
  hearings: Hearing[];
  invoices: Invoice[];
  communications: Communication[];
  audit: AuditEvent[];
  notices: Notice[];
}
