import { useState, type FormEvent } from "react";
import { PageHead } from "../components/ui";
import { CATEGORY_LABEL, CATEGORY_OPTIONS } from "../lib/fees";
import { formatDate } from "../lib/format";
import { ROLE_LABEL } from "../lib/labels";
import type { LawyerRole, MatterCategory } from "../types";
import { useStore } from "../store/StoreContext";

export function Lawyers() {
  const { state, addLawyer } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHead title="Lawyers" lede="Onboard counsel so they can be assigned to a Case ID.">
        <button className="btn btn-primary" type="button" onClick={() => setOpen((v) => !v)}>
          {open ? "Close form" : "Onboard lawyer"}
        </button>
      </PageHead>

      {open ? <LawyerForm onDone={() => setOpen(false)} onSave={addLawyer} /> : null}

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Practice</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Files</th>
              </tr>
            </thead>
            <tbody>
              {state.lawyers.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.name}</td>
                  <td>{ROLE_LABEL[l.role]}</td>
                  <td>{l.practiceAreas.map((p) => CATEGORY_LABEL[p]).join(", ")}</td>
                  <td>
                    {l.email}
                    <div className="lede">{l.phone}</div>
                  </td>
                  <td>{formatDate(l.createdAt)}</td>
                  <td>{state.matters.filter((m) => m.assignedLawyerId === l.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LawyerForm({
  onDone,
  onSave,
}: {
  onDone: () => void;
  onSave: ReturnType<typeof useStore>["addLawyer"];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<LawyerRole>("associate");
  const [areas, setAreas] = useState<MatterCategory[]>(["civil"]);

  function toggle(cat: MatterCategory) {
    setAreas((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), role, practiceAreas: areas });
    onDone();
  }

  return (
    <form className="card" onSubmit={submit} style={{ marginBottom: 16 }}>
      <div className="card-h">New lawyer</div>
      <div className="card-b form">
        <div className="fields">
          <div className="field">
            <label htmlFor="lyr-name">Name</label>
            <input id="lyr-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lyr-role">Role</label>
            <select id="lyr-role" value={role} onChange={(e) => setRole(e.target.value as LawyerRole)}>
              {Object.entries(ROLE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lyr-email">Email</label>
            <input id="lyr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lyr-phone">Phone</label>
            <input id="lyr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field span-2">
            <span className="field-label">Practice areas</span>
            <div className="row-actions">
              {CATEGORY_OPTIONS.map((cat) => (
                <label key={cat} className="check">
                  <input type="checkbox" checked={areas.includes(cat)} onChange={() => toggle(cat)} />
                  {CATEGORY_LABEL[cat]}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="row-actions">
          <button className="btn btn-primary" type="submit">
            Issue lawyer record
          </button>
        </div>
      </div>
    </form>
  );
}
