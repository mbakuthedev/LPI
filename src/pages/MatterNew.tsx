import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHead } from "../components/ui";
import { CATEGORY_LABEL, CATEGORY_OPTIONS, SIGN_ON_FEES } from "../lib/fees";
import { naira } from "../lib/format";
import { ROLE_LABEL } from "../lib/labels";
import type { MatterCategory } from "../types";
import { useStore } from "../store/StoreContext";

export function MatterNew() {
  const { state, openMatter } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(params.get("client") ?? state.clients[0]?.id ?? "");
  const [conflictCleared, setConflictCleared] = useState(false);
  const [category, setCategory] = useState<MatterCategory>("civil");
  const [title, setTitle] = useState("");
  const [assignedLawyerId, setAssignedLawyerId] = useState(state.lawyers[0]?.id ?? "");
  const [engagementAcknowledged, setEngagementAcknowledged] = useState(false);
  const [memo, setMemo] = useState("");
  const [minutes, setMinutes] = useState("");
  const [actionPoints, setActionPoints] = useState("");
  const [opposingParty, setOpposingParty] = useState("");
  const [opposingEmail, setOpposingEmail] = useState("");

  const client = state.clients.find((c) => c.id === clientId);
  const lawyer = state.lawyers.find((l) => l.id === assignedLawyerId);
  const fee = SIGN_ON_FEES[category];

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(clientId);
    if (step === 2) return conflictCleared;
    if (step === 3) return Boolean(title.trim());
    if (step === 4) return Boolean(assignedLawyerId);
    if (step === 5) return engagementAcknowledged;
    return true;
  }, [assignedLawyerId, clientId, conflictCleared, engagementAcknowledged, step, title]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!conflictCleared || !engagementAcknowledged) return;
    const matter = openMatter({
      clientId,
      category,
      title: title.trim(),
      assignedLawyerId,
      conflictCleared,
      engagementAcknowledged,
      memo,
      minutes,
      actionPoints,
      opposingParty,
      opposingEmail,
    });
    navigate(`/matters/${matter.id}`);
  }

  return (
    <div>
      <PageHead title="Open a matter" lede="Conflict first, then category. Case ID and the sign-on invoice are created together." />

      <div className="steps">
        {["Client", "Conflict", "Category", "Lawyer", "Engagement", "Details"].map((label, i) => (
          <span key={label} className={step === i + 1 ? "on" : ""}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <form className="card" onSubmit={submit}>
        <div className="card-b form">
          {step === 1 && (
            <>
              <div className="field">
                <label htmlFor="mt-client">Client</label>
                <select id="mt-client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  {state.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="lede">
                Need someone new? <Link to="/clients">Onboard a client</Link> first — Client ID is issued there.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <p>
                Search the existing files for {client?.name}. This prototype records a manual clearance — do not skip it
                on a live instruction.
              </p>
              <label className="check">
                <input
                  type="checkbox"
                  checked={conflictCleared}
                  onChange={(e) => setConflictCleared(e.target.checked)}
                />
                Conflict search completed. No current adverse interest against this client.
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <div className="fields">
                <div className="field">
                  <label htmlFor="mt-cat">Category of matter</label>
                  <select
                    id="mt-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MatterCategory)}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="mt-title">Short title</label>
                  <input
                    id="mt-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Adeyemi v Adeyemi — dissolution"
                    required
                  />
                </div>
              </div>
              <div className="fee-preview">
                Sign-on fee for {CATEGORY_LABEL[category]} is hardcoded at <strong>{naira(fee)}</strong>. Selecting the
                category fills the first invoice. Case ID is generated on save.
              </div>
            </>
          )}

          {step === 4 && (
            <div className="field">
              <label htmlFor="mt-lawyer">Assign lawyer</label>
              <select
                id="mt-lawyer"
                value={assignedLawyerId}
                onChange={(e) => setAssignedLawyerId(e.target.value)}
              >
                {state.lawyers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {ROLE_LABEL[l.role]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 5 && (
            <label className="check">
              <input
                type="checkbox"
                checked={engagementAcknowledged}
                onChange={(e) => setEngagementAcknowledged(e.target.checked)}
              />
              Client has accepted the engagement and the {naira(fee)} sign-on fee for this instruction.
            </label>
          )}

          {step === 6 && (
            <>
              <div className="field">
                <label htmlFor="mt-memo">Memo</label>
                <textarea id="mt-memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="mt-min">Minutes of meeting</label>
                <textarea id="mt-min" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="mt-ap">Summary of action points</label>
                <textarea id="mt-ap" value={actionPoints} onChange={(e) => setActionPoints(e.target.value)} />
              </div>
              <div className="fields">
                <div className="field">
                  <label htmlFor="mt-opp">Opposing party</label>
                  <input id="mt-opp" value={opposingParty} onChange={(e) => setOpposingParty(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="mt-opp-em">Other party email</label>
                  <input
                    id="mt-opp-em"
                    type="email"
                    value={opposingEmail}
                    onChange={(e) => setOpposingEmail(e.target.value)}
                  />
                </div>
              </div>
              <p className="lede">
                {client?.name} · {CATEGORY_LABEL[category]} · {lawyer?.name} · first invoice {naira(fee)}
              </p>
            </>
          )}

          <div className="row-actions">
            {step > 1 ? (
              <button className="btn" type="button" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            ) : null}
            {step < 6 ? (
              <button className="btn btn-primary" type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue
              </button>
            ) : (
              <button className="btn btn-primary" type="submit">
                Generate Case ID and first invoice
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
