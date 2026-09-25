import { Link } from "react-router-dom";
import { PageHead, StatusPill } from "../components/ui";
import { CATEGORY_LABEL } from "../lib/fees";
import { formatDate } from "../lib/format";
import { useStore } from "../store/StoreContext";

export function Matters() {
  const { state } = useStore();
  const rows = [...state.matters].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHead title="Matters" lede="Every file has a Case ID. Open from a client after conflict and engagement.">
        <Link className="btn btn-primary" to="/matters/new">
          Open a matter
        </Link>
      </PageHead>
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Client</th>
                <th>Category</th>
                <th>Lawyer</th>
                <th>Court no.</th>
                <th>Opened</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link to={`/matters/${m.id}`}>{m.id}</Link>
                  </td>
                  <td>{m.title}</td>
                  <td>
                    <Link to={`/clients/${m.clientId}`}>
                      {state.clients.find((c) => c.id === m.clientId)?.name}
                    </Link>
                  </td>
                  <td>{CATEGORY_LABEL[m.category]}</td>
                  <td>{state.lawyers.find((l) => l.id === m.assignedLawyerId)?.name}</td>
                  <td>{m.courtCaseNumber || "—"}</td>
                  <td>{formatDate(m.createdAt)}</td>
                  <td>
                    <StatusPill status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
