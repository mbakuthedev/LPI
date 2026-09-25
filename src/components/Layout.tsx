import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Landmark,
  LayoutDashboard,
  Receipt,
  Scale,
  Users,
} from "lucide-react";
import { useStore } from "../store/StoreContext";

const LINKS = [
  { to: "/", label: "Chambers", icon: LayoutDashboard, end: true },
  { to: "/matters", label: "Matters", icon: Briefcase },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/lawyers", label: "Lawyers", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/integrations", label: "Court registry", icon: Landmark },
];

export function Layout() {
  const { state, firm, dismissNotice, resetDemo } = useStore();
  const navigate = useNavigate();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CAUSELIST</div>
          <div className="brand-sub">{firm}</div>
        </div>
        <nav className="nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "active" : "")}>
              <link.icon size={16} strokeWidth={1.75} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Scale size={14} strokeWidth={1.75} /> Lagos chambers · v1 prototype
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar no-print">
          <input
            className="topbar-search"
            placeholder="Find a Case ID, client, or invoice…"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const q = e.currentTarget.value.trim().toUpperCase();
              const matter = state.matters.find((m) => m.id.toUpperCase() === q || m.courtCaseNumber.toUpperCase() === q);
              const client = state.clients.find((c) => c.id.toUpperCase() === q);
              const invoice = state.invoices.find((i) => i.id.toUpperCase() === q);
              if (matter) navigate(`/matters/${matter.id}`);
              else if (client) navigate(`/clients/${client.id}`);
              else if (invoice) navigate(`/invoices/${invoice.id}`);
            }}
          />
          <button className="btn btn-ghost" type="button" onClick={resetDemo}>
            Reset demo
          </button>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
      <div className="notice-stack">
        {state.notices.map((n) => (
          <button key={n.id} className="notice" type="button" onClick={() => dismissNotice(n.id)}>
            {n.message}
          </button>
        ))}
      </div>
    </div>
  );
}
