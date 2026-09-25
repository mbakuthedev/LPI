import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { InvoicePill, PageHead, StatusPill } from "../components/ui";
import { CATEGORY_LABEL } from "../lib/fees";
import { formatDate, formatDateTime, naira } from "../lib/format";
import {
  ACTION_LABEL,
  ACTION_OPTIONS,
  INVOICE_TYPE_LABEL,
  OUTCOME_LABEL,
  OUTCOME_OPTIONS,
  PARTY_LABEL,
} from "../lib/labels";
import type { LineOfActionType, PartyRole, PostHearingOutcome } from "../types";
import { useStore } from "../store/StoreContext";

const TABS = ["Overview", "Details", "Parties", "Actions", "Documents", "Hearings", "Invoices", "Log"] as const;
type Tab = (typeof TABS)[number];

export function MatterFile() {
  const { id } = useParams();
  const store = useStore();
  const matter = store.state.matters.find((m) => m.id === id);
  const [tab, setTab] = useState<Tab>("Overview");

  if (!matter) return <p>Matter not found.</p>;

  const client = store.state.clients.find((c) => c.id === matter.clientId);
  const lawyer = store.state.lawyers.find((l) => l.id === matter.assignedLawyerId);

  return (
    <div>
      <PageHead title={matter.title} lede={`${matter.id} · ${client?.name} · ${CATEGORY_LABEL[matter.category]}`}>
        <StatusPill status={matter.status} />
        <Link className="btn" to="/integrations">
          Court lookup
        </Link>
      </PageHead>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} type="button" onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid-2">
          <section className="card">
            <div className="card-h">File</div>
            <dl className="meta card-b">
              <div>
                <dt>Case ID</dt>
                <dd>{matter.id}</dd>
              </div>
              <div>
                <dt>Client ID</dt>
                <dd>
                  <Link to={`/clients/${client?.id}`}>{client?.id}</Link>
                </dd>
              </div>
              <div>
                <dt>Assigned lawyer</dt>
                <dd>{lawyer?.name}</dd>
              </div>
              <div>
                <dt>Court case number</dt>
                <dd>{matter.courtCaseNumber || "Not yet allocated"}</dd>
              </div>
              <div>
                <dt>Conflict</dt>
                <dd>{matter.conflictCleared ? "Cleared" : "Not cleared"}</dd>
              </div>
              <div>
                <dt>Engagement</dt>
                <dd>{matter.engagementAcknowledged ? "Acknowledged" : "Pending"}</dd>
              </div>
            </dl>
          </section>
          <section className="card">
            <div className="card-h">Action points</div>
            <div className="card-b" style={{ whiteSpace: "pre-wrap" }}>
              {matter.actionPoints || "None recorded."}
            </div>
          </section>
        </div>
      )}

      {tab === "Details" && <DetailsTab key={matter.id} />}
      {tab === "Parties" && <PartiesTab key={matter.id} />}
      {tab === "Actions" && <ActionsTab key={matter.id} />}
      {tab === "Documents" && <DocumentsTab key={matter.id} />}
      {tab === "Hearings" && <HearingsTab key={matter.id} />}
      {tab === "Invoices" && <InvoicesTab key={matter.id} />}
      {tab === "Log" && <LogTab key={matter.id} />}
    </div>
  );
}

function useMatter() {
  const { id } = useParams();
  const store = useStore();
  const matter = store.state.matters.find((m) => m.id === id);
  if (!matter) throw new Error("missing matter");
  return { matter, store };
}

function DetailsTab() {
  const { matter, store } = useMatter();
  const [memo, setMemo] = useState(matter.memo);
  const [minutes, setMinutes] = useState(matter.minutes);
  const [actionPoints, setActionPoints] = useState(matter.actionPoints);
  const [courtCaseNumber, setCourtCaseNumber] = useState(matter.courtCaseNumber);
  const [lawyerId, setLawyerId] = useState(matter.assignedLawyerId);

  function save(e: FormEvent) {
    e.preventDefault();
    store.updateMatter(matter.id, { memo, minutes, actionPoints, courtCaseNumber, assignedLawyerId: lawyerId });
  }

  return (
    <form className="card" onSubmit={save}>
      <div className="card-h">Matter details</div>
      <div className="card-b form">
        <div className="fields">
          <div className="field">
            <label htmlFor="dt-court">Court case number</label>
            <input
              id="dt-court"
              value={courtCaseNumber}
              onChange={(e) => setCourtCaseNumber(e.target.value)}
              placeholder="LD/1234/2026"
            />
          </div>
          <div className="field">
            <label htmlFor="dt-lyr">Assigned lawyer</label>
            <select id="dt-lyr" value={lawyerId} onChange={(e) => setLawyerId(e.target.value)}>
              {store.state.lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="dt-memo">Memo</label>
          <textarea id="dt-memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dt-min">Minutes of meeting</label>
          <textarea id="dt-min" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dt-ap">Summary of action points</label>
          <textarea id="dt-ap" value={actionPoints} onChange={(e) => setActionPoints(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">
          Save details
        </button>
      </div>
    </form>
  );
}

function PartiesTab() {
  const { matter, store } = useMatter();
  const [role, setRole] = useState<PartyRole>("opposing_party");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    store.addParty(matter.id, { role, name: name.trim(), email: email.trim(), phone: phone.trim() });
    setName("");
    setEmail("");
    setPhone("");
  }

  return (
    <div className="grid-2">
      <section className="card">
        <div className="card-h">On the record</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {matter.parties.map((p) => (
                <tr key={p.id}>
                  <td>{PARTY_LABEL[p.role]}</td>
                  <td>{p.name}</td>
                  <td>
                    {p.email || "—"}
                    <div className="lede">{p.phone}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form className="card" onSubmit={submit}>
        <div className="card-h">Add party</div>
        <div className="card-b form">
          <div className="field">
            <label htmlFor="pt-role">Role</label>
            <select id="pt-role" value={role} onChange={(e) => setRole(e.target.value as PartyRole)}>
              {Object.entries(PARTY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pt-name">Name</label>
            <input id="pt-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="pt-email">Email</label>
            <input id="pt-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pt-phone">Phone</label>
            <input id="pt-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">
            Add to file
          </button>
        </div>
      </form>
    </div>
  );
}

function ActionsTab() {
  const { matter, store } = useMatter();
  const docs = store.state.documents.filter((d) => d.matterId === matter.id);
  const rows = store.state.actions.filter((a) => a.matterId === matter.id);
  const other = matter.parties.find((p) => p.role === "opposing_party" || p.role === "opposing_counsel");
  const [type, setType] = useState<LineOfActionType>("send_correspondence");
  const [notes, setNotes] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [emailOtherParty, setEmailOtherParty] = useState(false);
  const [otherPartyEmail, setOtherPartyEmail] = useState(other?.email ?? "");
  const [cost, setCost] = useState(0);

  function submit(e: FormEvent) {
    e.preventDefault();
    store.addAction({
      matterId: matter.id,
      type,
      notes,
      documentId,
      emailOtherParty,
      otherPartyEmail,
      cost: type === "off_cycle_cost" ? cost : 0,
    });
    setNotes("");
    setCost(0);
  }

  return (
    <div className="grid-2">
      <section className="card">
        <div className="card-h">Line of action</div>
        <ul className="timeline" style={{ padding: 16 }}>
          {rows.length === 0 ? <li>No steps recorded yet.</li> : null}
          {rows.map((a) => (
            <li key={a.id}>
              <strong>{ACTION_LABEL[a.type]}</strong>
              <div>{a.notes}</div>
              <div className="lede">
                {formatDateTime(a.createdAt)}
                {a.emailOtherParty ? ` · emailed ${a.otherPartyEmail}` : ""}
                {a.cost ? ` · ${naira(a.cost)}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <form className="card" onSubmit={submit}>
        <div className="card-h">Record a step</div>
        <div className="card-b form">
          <div className="field">
            <label htmlFor="ac-type">Action</label>
            <select id="ac-type" value={type} onChange={(e) => setType(e.target.value as LineOfActionType)}>
              {ACTION_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {ACTION_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ac-notes">Notes</label>
            <textarea id="ac-notes" value={notes} onChange={(e) => setNotes(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="ac-doc">Linked document</label>
            <select id="ac-doc" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
              <option value="">None — upload under Documents first</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {type === "off_cycle_cost" ? (
            <div className="field">
              <label htmlFor="ac-cost">Cost to invoice</label>
              <input
                id="ac-cost"
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          ) : null}
          <label className="check">
            <input
              type="checkbox"
              checked={emailOtherParty}
              onChange={(e) => setEmailOtherParty(e.target.checked)}
            />
            Send this document to the other party by email
          </label>
          {emailOtherParty ? (
            <div className="field">
              <label htmlFor="ac-em">Other party email</label>
              <input
                id="ac-em"
                type="email"
                value={otherPartyEmail}
                onChange={(e) => setOtherPartyEmail(e.target.value)}
                required
              />
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit">
            Record action
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentsTab() {
  const { matter, store } = useMatter();
  const docs = store.state.documents.filter((d) => d.matterId === matter.id);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("Correspondence");
  const [source, setSource] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");

  function onFile(file: File | undefined) {
    if (!file) return;
    setName(file.name);
    setSizeLabel(`${Math.max(1, Math.round(file.size / 1024))} KB`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    store.addDocument({
      matterId: matter.id,
      name: name.trim(),
      kind,
      source,
      url: source === "url" ? url : "",
      sizeLabel: source === "url" ? "URL" : sizeLabel || "Uploaded",
    });
    setName("");
    setUrl("");
    setSizeLabel("");
  }

  return (
    <div className="grid-2">
      <section className="card">
        <div className="card-h">On the file</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Kind</th>
                <th>Source</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer">
                        {d.name}
                      </a>
                    ) : (
                      d.name
                    )}
                    <div className="lede">{d.sizeLabel}</div>
                  </td>
                  <td>{d.kind}</td>
                  <td>{d.source}</td>
                  <td>{formatDateTime(d.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form className="card" onSubmit={submit}>
        <div className="card-h">Upload or attach URL</div>
        <div className="card-b form">
          <div className="field">
            <label htmlFor="dc-kind">Kind</label>
            <input id="dc-kind" value={kind} onChange={(e) => setKind(e.target.value)} />
          </div>
          <div className="row-actions">
            <button className={`btn ${source === "upload" ? "btn-primary" : ""}`} type="button" onClick={() => setSource("upload")}>
              Web / file upload
            </button>
            <button className={`btn ${source === "url" ? "btn-primary" : ""}`} type="button" onClick={() => setSource("url")}>
              Mobile / URL
            </button>
          </div>
          {source === "upload" ? (
            <div className="field">
              <label htmlFor="dc-file">File</label>
              <input id="dc-file" type="file" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="dc-url">Document URL</label>
              <input id="dc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
          )}
          <div className="field">
            <label htmlFor="dc-name">Display name</label>
            <input id="dc-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit">
            Add to file
          </button>
        </div>
      </form>
    </div>
  );
}

function HearingsTab() {
  const { matter, store } = useMatter();
  const hearings = store.state.hearings.filter((h) => h.matterId === matter.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [court, setCourt] = useState("High Court of Lagos State, Ikeja");
  const [memo, setMemo] = useState("");
  const [hearingNotice, setHearingNotice] = useState("");
  const [outcomeFor, setOutcomeFor] = useState("");
  const [outcome, setOutcome] = useState<PostHearingOutcome>("adjournment");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [nextDate, setNextDate] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    store.addHearing({ matterId: matter.id, date, time, court, memo, hearingNotice });
    setDate("");
    setMemo("");
    setHearingNotice("");
  }

  function saveOutcome(e: FormEvent) {
    e.preventDefault();
    if (!outcomeFor) return;
    store.recordOutcome(outcomeFor, { outcome, outcomeNotes, nextDate });
    setOutcomeNotes("");
  }

  return (
    <div>
      <div className="grid-2">
        <section className="card">
          <div className="card-h">Diary</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Court</th>
                  <th>Reminder</th>
                  <th>Invoice</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {hearings.map((h) => (
                  <tr key={h.id}>
                    <td>
                      {formatDate(h.date)} {h.time}
                      <div className="lede">{h.outcome ? OUTCOME_LABEL[h.outcome] : "Listed"}</div>
                    </td>
                    <td>
                      {h.court}
                      <div className="lede">{h.memo}</div>
                    </td>
                    <td>
                      {h.reminderSent ? (
                        <span className="pill pill-ok">Sent</span>
                      ) : (
                        <button className="btn" type="button" onClick={() => store.sendReminder(h.id)}>
                          Email lawyer
                        </button>
                      )}
                    </td>
                    <td>
                      {h.invoiceId ? <Link to={`/invoices/${h.invoiceId}`}>{h.invoiceId}</Link> : "—"}
                    </td>
                    <td>
                      <button className="btn btn-ghost" type="button" onClick={() => setOutcomeFor(h.id)}>
                        Outcome
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <form className="card" onSubmit={submit}>
          <div className="card-h">List an appearance</div>
          <div className="card-b form">
            <div className="fields">
              <div className="field">
                <label htmlFor="hr-date">Date</label>
                <input id="hr-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="hr-time">Time</label>
                <input id="hr-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="hr-court">Court</label>
              <input id="hr-court" value={court} onChange={(e) => setCourt(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="hr-notice">Hearing notice</label>
              <input id="hr-notice" value={hearingNotice} onChange={(e) => setHearingNotice(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="hr-memo">Court memo</label>
              <textarea id="hr-memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
            <p className="lede">Saving this diaries the date, drafts the appearance invoice, and can later email the assigned lawyer.</p>
            <button className="btn btn-primary" type="submit">
              Diary and invoice
            </button>
          </div>
        </form>
      </div>

      {outcomeFor ? (
        <form className="card" onSubmit={saveOutcome} style={{ marginTop: 16 }}>
          <div className="card-h">Post-court appearance · {outcomeFor}</div>
          <div className="card-b form">
            <div className="fields">
              <div className="field">
                <label htmlFor="oc-type">Outcome</label>
                <select
                  id="oc-type"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as PostHearingOutcome)}
                >
                  {OUTCOME_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {OUTCOME_LABEL[o]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="oc-next">Next date</label>
                <input id="oc-next" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="oc-notes">Notes</label>
              <textarea id="oc-notes" value={outcomeNotes} onChange={(e) => setOutcomeNotes(e.target.value)} />
            </div>
            <div className="row-actions">
              <button className="btn btn-primary" type="submit">
                Save outcome
              </button>
              <button className="btn" type="button" onClick={() => setOutcomeFor("")}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function InvoicesTab() {
  const { matter, store } = useMatter();
  const invoices = store.state.invoices.filter((i) => i.matterId === matter.id);

  return (
    <section className="card">
      <div className="card-h">Bills on this file</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link to={`/invoices/${inv.id}`}>{inv.id}</Link>
                  <div className="lede">{inv.description}</div>
                </td>
                <td>{INVOICE_TYPE_LABEL[inv.type]}</td>
                <td>{naira(inv.amount)}</td>
                <td>
                  <InvoicePill status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LogTab() {
  const { matter, store } = useMatter();
  const comms = store.state.communications.filter((c) => c.matterId === matter.id);
  const audit = store.state.audit.filter((a) => a.entityId === matter.id || comms.some((c) => c.id === a.entityId));
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    store.addCommunication({ matterId: matter.id, channel: "note", subject, body });
    setSubject("");
    setBody("");
  }

  return (
    <div className="grid-2">
      <section className="card">
        <div className="card-h">Communications and audit</div>
        <ul className="timeline" style={{ padding: 16 }}>
          {comms.map((c) => (
            <li key={c.id}>
              <strong>{c.subject}</strong>
              <div>{c.body}</div>
              <div className="lede">
                {formatDateTime(c.at)} · {c.channel}
              </div>
            </li>
          ))}
          {audit.map((a) => (
            <li key={a.id}>
              <strong>{a.action}</strong>
              <div className="lede">
                {formatDateTime(a.at)} · {a.actor}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <form className="card" onSubmit={submit}>
        <div className="card-h">File note</div>
        <div className="card-b form">
          <div className="field">
            <label htmlFor="lg-sub">Subject</label>
            <input id="lg-sub" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lg-body">Note</label>
            <textarea id="lg-body" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit">
            Add to log
          </button>
        </div>
      </form>
    </div>
  );
}
