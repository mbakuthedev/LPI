import type { ReactNode } from "react";
import type { InvoiceStatus, MatterStatus } from "../types";

export function StatusPill({ status }: { status: MatterStatus }) {
  const tone =
    status === "closed" || status === "judgment"
      ? "pill-ok"
      : status === "in_court"
        ? "pill-danger"
        : status === "intake"
          ? "pill-warn"
          : "pill-info";
  const label: Record<MatterStatus, string> = {
    intake: "Intake",
    active: "Active",
    in_court: "In court",
    adr: "ADR",
    judgment: "Judgement",
    closed: "Closed",
  };
  return <span className={`pill ${tone}`}>{label[status]}</span>;
}

export function InvoicePill({ status }: { status: InvoiceStatus }) {
  const tone =
    status === "paid" ? "pill-ok" : status === "overdue" ? "pill-danger" : status === "sent" ? "pill-warn" : "pill-info";
  return <span className={`pill ${tone}`}>{status}</span>;
}

export function PageHead({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      <div className="row-actions">{children}</div>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
