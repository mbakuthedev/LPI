import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InvoicePill, Modal, PageHead } from "../components/ui";
import { formatDate, naira } from "../lib/format";
import { INVOICE_TYPE_LABEL } from "../lib/labels";
import { FIRM_ADDRESS, FIRM_EMAIL, FIRM_NAME, FIRM_PHONE } from "../store/seed";
import { useStore } from "../store/StoreContext";

export function Invoices() {
  const { state } = useStore();
  const rows = [...state.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <div>
      <PageHead title="Invoices" lede="Generate, download, email, and record payment. Sign-on fees follow the matter category." />
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Matter</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link to={`/invoices/${inv.id}`}>{inv.id}</Link>
                    <div className="lede">{inv.description}</div>
                  </td>
                  <td>{state.clients.find((c) => c.id === inv.clientId)?.name}</td>
                  <td>
                    <Link to={`/matters/${inv.matterId}`}>{inv.matterId}</Link>
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
    </div>
  );
}

export function InvoiceView() {
  const { id } = useParams();
  const { state, sendInvoice, recordPayment } = useStore();
  const invoice = state.invoices.find((i) => i.id === id);
  const [mailOpen, setMailOpen] = useState(false);
  const [to, setTo] = useState("");

  if (!invoice) return <p>Invoice not found.</p>;

  const client = state.clients.find((c) => c.id === invoice.clientId);
  const matter = state.matters.find((m) => m.id === invoice.matterId);

  function download() {
    if (!invoice || !client || !matter) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.id}</title></head><body style="font-family:Georgia,serif;padding:40px">
      <h1>${FIRM_NAME}</h1>
      <p>${FIRM_ADDRESS}<br>${FIRM_EMAIL} · ${FIRM_PHONE}</p>
      <h2>Invoice ${invoice.id}</h2>
      <p>To: ${client.name}<br>${client.address}<br>${client.email}</p>
      <p>Matter: ${matter.id} — ${matter.title}</p>
      <p>${invoice.description}</p>
      <h3>${naira(invoice.amount)}</h3>
      <p>Issued ${formatDate(invoice.issuedAt)}</p>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHead title={invoice.id} lede={invoice.description}>
        <button className="btn no-print" type="button" onClick={() => window.print()}>
          Print
        </button>
        <button className="btn no-print" type="button" onClick={download}>
          Download
        </button>
        <button
          className="btn btn-primary no-print"
          type="button"
          onClick={() => {
            setTo(invoice.emailedTo || client?.email || "");
            setMailOpen(true);
          }}
        >
          Send via mail
        </button>
        {invoice.status !== "paid" ? (
          <button className="btn btn-ok no-print" type="button" onClick={() => recordPayment(invoice.id)}>
            Record payment
          </button>
        ) : null}
      </PageHead>

      <article className="invoice-sheet">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
          <div>
            <h1>{FIRM_NAME}</h1>
            <p className="lede">
              {FIRM_ADDRESS}
              <br />
              {FIRM_EMAIL} · {FIRM_PHONE}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <InvoicePill status={invoice.status} />
            <p>
              <strong>{invoice.id}</strong>
              <br />
              Issued {formatDate(invoice.issuedAt)}
            </p>
          </div>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--rule)", margin: "20px 0" }} />
        <p>
          <strong>Bill to</strong>
          <br />
          {client?.name}
          <br />
          {client?.address}
          <br />
          {client?.email}
        </p>
        <p>
          <strong>Matter</strong>
          <br />
          <Link to={`/matters/${matter?.id}`}>{matter?.id}</Link> — {matter?.title}
        </p>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{invoice.description}</td>
              <td>{INVOICE_TYPE_LABEL[invoice.type]}</td>
              <td>{naira(invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 28, marginTop: 20 }}>
          {naira(invoice.amount)}
        </p>
        {invoice.emailedTo ? <p className="lede">Last emailed to {invoice.emailedTo}</p> : null}
        {invoice.paidAt ? <p className="lede">Paid {formatDate(invoice.paidAt)}</p> : null}
      </article>

      {mailOpen ? (
        <Modal title="Send invoice via mail" onClose={() => setMailOpen(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendInvoice(invoice.id, to);
              setMailOpen(false);
            }}
          >
            <div className="field">
              <label htmlFor="inv-to">Recipient</label>
              <input id="inv-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
            </div>
            <p className="lede">
              Prototype mailer — records the send on the file log. No live SMTP in v1.
            </p>
            <div className="row-actions">
              <button className="btn btn-primary" type="submit">
                Send
              </button>
              <button className="btn" type="button" onClick={() => setMailOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
