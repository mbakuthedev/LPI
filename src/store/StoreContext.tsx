import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { APPEARANCE_FEE, CATEGORY_LABEL, SIGN_ON_FEES } from "../lib/fees";
import { lookupCourt } from "../lib/court";
import { nextSerial, todayIso, uid } from "../lib/format";
import type {
  AppState,
  Client,
  Communication,
  CourtLookup,
  Hearing,
  Invoice,
  Lawyer,
  Matter,
  MatterAction,
  MatterDocument,
  Party,
  PostHearingOutcome,
} from "../types";
import { FIRM_NAME, seedState } from "./seed";

const STORAGE_KEY = "causelist.v1";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.matters || !parsed.clients) return seedState();
    return { ...seedState(), ...parsed, notices: [] };
  } catch {
    return seedState();
  }
}

function persist(state: AppState) {
  const rest: AppState = { ...state, notices: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

interface StoreApi {
  state: AppState;
  firm: string;
  addLawyer: (input: Omit<Lawyer, "id" | "createdAt">) => Lawyer;
  addClient: (input: Omit<Client, "id" | "createdAt">) => Client;
  openMatter: (input: {
    clientId: string;
    category: Matter["category"];
    title: string;
    assignedLawyerId: string;
    conflictCleared: boolean;
    engagementAcknowledged: boolean;
    memo: string;
    minutes: string;
    actionPoints: string;
    opposingParty: string;
    opposingEmail: string;
  }) => Matter;
  updateMatter: (id: string, patch: Partial<Matter>) => void;
  addParty: (matterId: string, party: Omit<Party, "id">) => void;
  addDocument: (input: Omit<MatterDocument, "id" | "uploadedAt">) => MatterDocument;
  addAction: (input: Omit<MatterAction, "id" | "createdAt">) => MatterAction;
  addHearing: (input: {
    matterId: string;
    date: string;
    time: string;
    court: string;
    memo: string;
    hearingNotice: string;
  }) => Hearing;
  recordOutcome: (
    hearingId: string,
    input: { outcome: PostHearingOutcome; outcomeNotes: string; nextDate: string },
  ) => void;
  sendReminder: (hearingId: string) => void;
  sendInvoice: (invoiceId: string, to: string) => void;
  recordPayment: (invoiceId: string) => void;
  addCommunication: (input: Omit<Communication, "id" | "at">) => void;
  lookup: (system: CourtLookup["system"], caseNumber: string) => CourtLookup;
  dismissNotice: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  const commit = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const notice = useCallback((message: string) => {
    const item = { id: uid("note"), message };
    commit((prev) => ({ ...prev, notices: [...prev.notices, item] }));
    window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        notices: prev.notices.filter((n) => n.id !== item.id),
      }));
    }, 4200);
  }, [commit]);

  const audit = useCallback(
    (prev: AppState, action: string, entityType: string, entityId: string): AppState => ({
      ...prev,
      audit: [
        {
          id: uid("aud"),
          at: todayIso(),
          actor: "Chambers user",
          action,
          entityType,
          entityId,
        },
        ...prev.audit,
      ],
    }),
    [],
  );

  const api = useMemo<StoreApi>(() => {
    return {
      state,
      firm: FIRM_NAME,
      addLawyer(input) {
        const lawyer: Lawyer = {
          ...input,
          id: nextSerial("LYR", state.lawyers.map((l) => l.id)),
          createdAt: todayIso(),
        };
        commit((prev) =>
          audit({ ...prev, lawyers: [...prev.lawyers, lawyer] }, `Onboarded lawyer ${lawyer.name}`, "lawyer", lawyer.id),
        );
        notice(`Lawyer ${lawyer.id} created`);
        return lawyer;
      },
      addClient(input) {
        const client: Client = {
          ...input,
          id: nextSerial("CLT", state.clients.map((c) => c.id)),
          createdAt: todayIso(),
        };
        commit((prev) =>
          audit({ ...prev, clients: [...prev.clients, client] }, `Onboarded client ${client.name}`, "client", client.id),
        );
        notice(`Client ID ${client.id} issued`);
        return client;
      },
      openMatter(input) {
        const client = state.clients.find((c) => c.id === input.clientId);
        const matter: Matter = {
          id: nextSerial("CASE", state.matters.map((m) => m.id)),
          clientId: input.clientId,
          category: input.category,
          title: input.title,
          assignedLawyerId: input.assignedLawyerId,
          conflictCleared: input.conflictCleared,
          engagementAcknowledged: input.engagementAcknowledged,
          memo: input.memo,
          minutes: input.minutes,
          actionPoints: input.actionPoints,
          courtCaseNumber: "",
          status: "active",
          parties: [
            {
              id: uid("pty"),
              role: "client",
              name: client?.name ?? "Client",
              email: client?.email ?? "",
              phone: client?.phone ?? "",
            },
            ...(input.opposingParty
              ? [
                  {
                    id: uid("pty"),
                    role: "opposing_party" as const,
                    name: input.opposingParty,
                    email: input.opposingEmail,
                    phone: "",
                  },
                ]
              : []),
          ],
          createdAt: todayIso(),
        };
        const invoice: Invoice = {
          id: nextSerial("INV", state.invoices.map((i) => i.id)),
          matterId: matter.id,
          clientId: input.clientId,
          type: "sign_on",
          description: `Sign-on fee — ${CATEGORY_LABEL[input.category]}`,
          amount: SIGN_ON_FEES[input.category],
          status: "draft",
          issuedAt: todayIso(),
          paidAt: "",
          emailedTo: "",
        };
        commit((prev) =>
          audit(
            {
              ...prev,
              matters: [...prev.matters, matter],
              invoices: [...prev.invoices, invoice],
            },
            `Opened ${matter.id} and drafted ${invoice.id}`,
            "matter",
            matter.id,
          ),
        );
        notice(`Case ID ${matter.id} · first invoice ${invoice.id}`);
        return matter;
      },
      updateMatter(id, patch) {
        commit((prev) =>
          audit(
            {
              ...prev,
              matters: prev.matters.map((m) => (m.id === id ? { ...m, ...patch } : m)),
            },
            `Updated matter ${id}`,
            "matter",
            id,
          ),
        );
      },
      addParty(matterId, party) {
        commit((prev) => ({
          ...prev,
          matters: prev.matters.map((m) =>
            m.id === matterId ? { ...m, parties: [...m.parties, { ...party, id: uid("pty") }] } : m,
          ),
        }));
      },
      addDocument(input) {
        const doc: MatterDocument = {
          ...input,
          id: nextSerial("DOC", state.documents.map((d) => d.id)),
          uploadedAt: todayIso(),
        };
        commit((prev) =>
          audit({ ...prev, documents: [...prev.documents, doc] }, `Uploaded ${doc.name} to ${doc.matterId}`, "document", doc.id),
        );
        return doc;
      },
      addAction(input) {
        const action: MatterAction = {
          ...input,
          id: nextSerial("ACT", state.actions.map((a) => a.id)),
          createdAt: todayIso(),
        };
        let invoice: Invoice | null = null;
        if (input.type === "off_cycle_cost" && input.cost > 0) {
          const matter = state.matters.find((m) => m.id === input.matterId);
          invoice = {
            id: nextSerial("INV", state.invoices.map((i) => i.id)),
            matterId: input.matterId,
            clientId: matter?.clientId ?? "",
            type: "cost",
            description: `Off-cycle cost — ${input.notes || "disbursement"}`,
            amount: input.cost,
            status: "draft",
            issuedAt: todayIso(),
            paidAt: "",
            emailedTo: "",
          };
        }
        commit((prev) => {
          let next: AppState = {
            ...prev,
            actions: [...prev.actions, action],
            invoices: invoice ? [...prev.invoices, invoice] : prev.invoices,
          };
          if (input.emailOtherParty && input.otherPartyEmail) {
            next = {
              ...next,
              communications: [
                {
                  id: uid("com"),
                  matterId: input.matterId,
                  channel: "email",
                  subject: `Document sent to other party`,
                  body: `Sent to ${input.otherPartyEmail}. ${input.notes}`,
                  at: todayIso(),
                },
                ...next.communications,
              ],
            };
          }
          return audit(next, `Line of action on ${input.matterId}: ${input.type}`, "action", action.id);
        });
        if (input.emailOtherParty && input.otherPartyEmail) {
          notice(`Document emailed to ${input.otherPartyEmail}`);
        }
        return action;
      },
      addHearing(input) {
        const matter = state.matters.find((m) => m.id === input.matterId);
        const invoice: Invoice = {
          id: nextSerial("INV", state.invoices.map((i) => i.id)),
          matterId: input.matterId,
          clientId: matter?.clientId ?? "",
          type: "appearance",
          description: `Court appearance — ${input.date} · ${input.court}`,
          amount: APPEARANCE_FEE,
          status: "draft",
          issuedAt: todayIso(),
          paidAt: "",
          emailedTo: "",
        };
        const hearing: Hearing = {
          ...input,
          id: nextSerial("HRG", state.hearings.map((h) => h.id)),
          reminderSent: false,
          outcome: "",
          outcomeNotes: "",
          nextDate: "",
          invoiceId: invoice.id,
        };
        commit((prev) =>
          audit(
            {
              ...prev,
              hearings: [...prev.hearings, hearing],
              invoices: [...prev.invoices, invoice],
              matters: prev.matters.map((m) =>
                m.id === input.matterId ? { ...m, status: "in_court" } : m,
              ),
            },
            `Diaried hearing ${hearing.id} and drafted ${invoice.id}`,
            "hearing",
            hearing.id,
          ),
        );
        notice(`Hearing listed · appearance invoice ${invoice.id}`);
        return hearing;
      },
      recordOutcome(hearingId, input) {
        commit((prev) => {
          const hearing = prev.hearings.find((h) => h.id === hearingId);
          const status =
            input.outcome === "judgement"
              ? "judgment"
              : input.outcome === "dispute_resolution" || input.outcome === "arbitration" || input.outcome === "signed_agreement"
                ? "adr"
                : "in_court";
          return audit(
            {
              ...prev,
              hearings: prev.hearings.map((h) =>
                h.id === hearingId ? { ...h, ...input } : h,
              ),
              matters: prev.matters.map((m) =>
                m.id === hearing?.matterId ? { ...m, status } : m,
              ),
            },
            `Recorded post-hearing outcome on ${hearingId}`,
            "hearing",
            hearingId,
          );
        });
      },
      sendReminder(hearingId) {
        const hearing = state.hearings.find((h) => h.id === hearingId);
        const matter = state.matters.find((m) => m.id === hearing?.matterId);
        const lawyer = state.lawyers.find((l) => l.id === matter?.assignedLawyerId);
        commit((prev) =>
          audit(
            {
              ...prev,
              hearings: prev.hearings.map((h) =>
                h.id === hearingId ? { ...h, reminderSent: true } : h,
              ),
              communications: [
                {
                  id: uid("com"),
                  matterId: hearing?.matterId ?? "",
                  channel: "email",
                  subject: `Court reminder — ${hearing?.date} ${hearing?.time}`,
                  body: `To ${lawyer?.name ?? "assigned lawyer"} (${lawyer?.email ?? ""}). ${matter?.title}. ${hearing?.court}. Memo: ${hearing?.memo}`,
                  at: todayIso(),
                },
                ...prev.communications,
              ],
            },
            `Emailed hearing reminder to ${lawyer?.name ?? "assigned lawyer"}`,
            "hearing",
            hearingId,
          ),
        );
        notice(`Reminder sent to ${lawyer?.email ?? "assigned lawyer"}`);
      },
      sendInvoice(invoiceId, to) {
        commit((prev) => {
          const invoice = prev.invoices.find((i) => i.id === invoiceId);
          return audit(
            {
              ...prev,
              invoices: prev.invoices.map((i) =>
                i.id === invoiceId ? { ...i, status: i.status === "paid" ? "paid" : "sent", emailedTo: to } : i,
              ),
              communications: [
                {
                  id: uid("com"),
                  matterId: invoice?.matterId ?? "",
                  channel: "email",
                  subject: `Invoice ${invoiceId}`,
                  body: `Invoice ${invoiceId} emailed to ${to}.`,
                  at: todayIso(),
                },
                ...prev.communications,
              ],
            },
            `Emailed invoice ${invoiceId} to ${to}`,
            "invoice",
            invoiceId,
          );
        });
        notice(`Invoice emailed to ${to}`);
      },
      recordPayment(invoiceId) {
        commit((prev) =>
          audit(
            {
              ...prev,
              invoices: prev.invoices.map((i) =>
                i.id === invoiceId ? { ...i, status: "paid", paidAt: todayIso() } : i,
              ),
            },
            `Recorded payment on ${invoiceId}`,
            "invoice",
            invoiceId,
          ),
        );
        notice(`Payment recorded on ${invoiceId}`);
      },
      addCommunication(input) {
        commit((prev) => ({
          ...prev,
          communications: [
            { ...input, id: uid("com"), at: todayIso() },
            ...prev.communications,
          ],
        }));
      },
      lookup(system, caseNumber) {
        const result = lookupCourt(system, caseNumber);
        commit((prev) =>
          audit(
            prev,
            `Looked up ${caseNumber || "(blank)"} on ${system === "comis" ? "Lagos CoMiS" : "Lagos Judiciary"}`,
            "integration",
            caseNumber || system,
          ),
        );
        return result;
      },
      dismissNotice(id) {
        setState((prev) => ({ ...prev, notices: prev.notices.filter((n) => n.id !== id) }));
      },
      resetDemo() {
        const fresh = seedState();
        persist(fresh);
        setState(fresh);
        notice("Demo data restored");
      },
    };
  }, [audit, commit, notice, state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
