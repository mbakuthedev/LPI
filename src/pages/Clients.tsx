import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHead, StatusPill } from "../components/ui";
import { CATEGORY_LABEL } from "../lib/fees";
import { formatDate } from "../lib/format";
import { useStore } from "../store/StoreContext";

export function Clients() {
  const { state, addClient } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHead title="Clients" lede="Identity first. Client ID is issued when the record is saved.">
        <button className="btn btn-primary" type="button" onClick={() => setOpen((v) => !v)}>
          {open ? "Close form" : "Onboard client"}
        </button>
      </PageHead>

      {open ? <ClientForm onSave={addClient} /> : null}

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Matters</th>
              </tr>
            </thead>
            <tbody>
              {state.clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/clients/${c.id}`}>{c.id}</Link>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.address}</td>
                  <td>
                    {c.email}
                    <div className="lede">{c.phone}</div>
                  </td>
                  <td>{state.matters.filter((m) => m.clientId === c.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ClientForm({ onSave }: { onSave: ReturnType<typeof useStore>["addClient"] }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const client = onSave({
      name: name.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    navigate(`/clients/${client.id}`);
  }

  return (
    <form className="card" onSubmit={submit} style={{ marginBottom: 16 }}>
      <div className="card-h">New client</div>
      <div className="card-b form">
        <div className="fields">
          <div className="field">
            <label htmlFor="cl-name">Name</label>
            <input id="cl-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="cl-phone">Phone</label>
            <input id="cl-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="cl-email">Email</label>
            <input id="cl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="cl-address">Address</label>
            <input id="cl-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
        </div>
        <p className="lede">Client ID is generated at this point.</p>
        <button className="btn btn-primary" type="submit">
          Issue Client ID
        </button>
      </div>
    </form>
  );
}

export function ClientDetail() {
  const { id } = useParams();
  const { state } = useStore();
  const client = state.clients.find((c) => c.id === id);
  if (!client) return <p>Client not found.</p>;
  const matters = state.matters.filter((m) => m.clientId === client.id);

  return (
    <div>
      <PageHead title={client.name} lede={`${client.id} · onboarded ${formatDate(client.createdAt)}`}>
        <Link className="btn btn-primary" to={`/matters/new?client=${client.id}`}>
          Open a matter
        </Link>
      </PageHead>
      <div className="grid-2">
        <section className="card">
          <div className="card-h">Identity</div>
          <dl className="meta card-b">
            <div>
              <dt>Address</dt>
              <dd>{client.address}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{client.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{client.phone}</dd>
            </div>
            <div>
              <dt>Client ID</dt>
              <dd>{client.id}</dd>
            </div>
          </dl>
        </section>
        <section className="card">
          <div className="card-h">Matters</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {matters.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link to={`/matters/${m.id}`}>{m.id}</Link>
                    </td>
                    <td>
                      {m.title}
                      <div className="lede">{CATEGORY_LABEL[m.category]}</div>
                    </td>
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
    </div>
  );
}
