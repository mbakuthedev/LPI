import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/ui";
import { formatDate, formatDateTime } from "../lib/format";
import type { CourtLookup } from "../types";
import { useStore } from "../store/StoreContext";

export function Integrations() {
  const { state, lookup } = useStore();
  const [system, setSystem] = useState<CourtLookup["system"]>("comis");
  const [caseNumber, setCaseNumber] = useState("LD/1234/2026");
  const [result, setResult] = useState<CourtLookup | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setResult(lookup(system, caseNumber));
  }

  const linked = state.matters.find(
    (m) => m.courtCaseNumber && m.courtCaseNumber.toUpperCase() === caseNumber.trim().toUpperCase(),
  );

  return (
    <div>
      <PageHead
        title="Court registry"
        lede="Case numbers call the Lagos CoMiS and Lagos Judiciary endpoints. v1 returns stub dockets so the file workflow is real."
      />

      <div className="grid-2">
        <form className="card" onSubmit={submit}>
          <div className="card-h">Look up a case number</div>
          <div className="card-b form">
            <div className="field">
              <label htmlFor="ig-sys">Registry</label>
              <select
                id="ig-sys"
                value={system}
                onChange={(e) => setSystem(e.target.value as CourtLookup["system"])}
              >
                <option value="comis">Lagos CoMiS — lagoscomis.lagosjudiciary.gov.ng</option>
                <option value="judiciary">Lagos State Judiciary — CoA demo host</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ig-no">Case number</label>
              <input id="ig-no" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} />
            </div>
            <p className="lede">Try LD/1234/2026 or LD/8841/2026 — those are on the demo files.</p>
            <button className="btn btn-primary" type="submit">
              Call endpoint
            </button>
          </div>
        </form>

        <section className="card">
          <div className="card-h">On our files</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Court no.</th>
                  <th>Case ID</th>
                </tr>
              </thead>
              <tbody>
                {state.matters
                  .filter((m) => m.courtCaseNumber)
                  .map((m) => (
                    <tr key={m.id}>
                      <td>{m.courtCaseNumber}</td>
                      <td>
                        <Link to={`/matters/${m.id}`}>{m.id}</Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {result ? (
        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-h">
            {result.system === "comis" ? "Lagos CoMiS" : "Lagos State Judiciary"} · stub
            {linked ? (
              <Link to={`/matters/${linked.id}`}>Open {linked.id}</Link>
            ) : (
              <span className="pill">No matching Case ID</span>
            )}
          </div>
          <dl className="meta card-b">
            <div>
              <dt>Suit</dt>
              <dd>{result.suit}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{result.status}</dd>
            </div>
            <div>
              <dt>Court</dt>
              <dd>{result.court}</dd>
            </div>
            <div>
              <dt>Division</dt>
              <dd>{result.division}</dd>
            </div>
            <div>
              <dt>Parties</dt>
              <dd>{result.parties}</dd>
            </div>
            <div>
              <dt>Next hearing</dt>
              <dd>{result.nextHearing ? formatDate(result.nextHearing) : "—"}</dd>
            </div>
          </dl>
          <ul>
            {result.filings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="lede" style={{ padding: "0 16px 16px" }}>
            Retrieved {formatDateTime(result.retrievedAt)}. Live credentials are not used in this prototype.
          </p>
        </section>
      ) : null}
    </div>
  );
}
