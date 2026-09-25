import { Link } from "react-router-dom";
import { InvoicePill, PageHead, StatusPill } from "../components/ui";
import { formatDate, formatDateTime, naira, todayDate } from "../lib/format";
import { useStore } from "../store/StoreContext";

export function Dashboard() {
  const { state } = useStore();
  const openMatters = state.matters.filter((m) => m.status !== "closed");
  const unpaid = state.invoices.filter((i) => i.status !== "paid");
  const upcoming = [...state.hearings]
    .filter((h) => h.date >= todayDate() && !h.outcome)
    .sort((a, b) => a.date.localeCompare(b.date));
  const collected = state.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <PageHead title="Chambers board" lede="Open files, upcoming sittings, and money still out.">
        <Link className="btn btn-primary" to="/matters/new">
          Open a matter
        </Link>
      </PageHead>

      <div className="stats">
        <div className="stat">
          <b>{openMatters.length}</b>
          <span>Open matters</span>
        </div>
        <div className="stat">
          <b>{upcoming.length}</b>
          <span>Hearings ahead</span>
        </div>
        <div className="stat">
          <b>{unpaid.length}</b>
          <span>Unpaid invoices</span>
        </div>
        <div className="stat">
          <b>{naira(collected)}</b>
          <span>Collected on file</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-h">Upcoming court</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matter</th>
                  <th>Court</th>
                  <th>Lawyer</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No sittings diaried.</td>
                  </tr>
                ) : (
                  upcoming.map((h) => {
                    const matter = state.matters.find((m) => m.id === h.matterId);
                    const lawyer = state.lawyers.find((l) => l.id === matter?.assignedLawyerId);
                    return (
                      <tr key={h.id}>
                        <td>
                          {formatDate(h.date)}
                          <div className="lede">{h.time}</div>
                        </td>
                        <td>
                          <Link to={`/matters/${h.matterId}`}>{matter?.id}</Link>
                          <div className="lede">{matter?.title}</div>
                        </td>
                        <td>{h.court}</td>
                        <td>{lawyer?.name}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-h">Unpaid bills</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {unpaid.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/invoices/${inv.id}`}>{inv.id}</Link>
                      <div className="lede">{inv.description}</div>
                    </td>
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
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          Open matters
          <Link to="/matters">All files</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Client</th>
                <th>Category</th>
                <th>Lawyer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {openMatters.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link to={`/matters/${m.id}`}>{m.id}</Link>
                  </td>
                  <td>{state.clients.find((c) => c.id === m.clientId)?.name}</td>
                  <td>{m.category}</td>
                  <td>{state.lawyers.find((l) => l.id === m.assignedLawyerId)?.name}</td>
                  <td>
                    <StatusPill status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-h">Audit log</div>
        <ul className="timeline" style={{ padding: 16 }}>
          {state.audit.slice(0, 8).map((a) => (
            <li key={a.id}>
              <strong>{a.action}</strong>
              <div className="lede">
                {formatDateTime(a.at)} · {a.actor}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
