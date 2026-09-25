import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/ui";
import { formatDate } from "../lib/format";
import { useStore } from "../store/StoreContext";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; inMonth: boolean; day: number }[] = [];
  for (let i = 0; i < startPad; i += 1) {
    const d = new Date(year, month, -startPad + i + 1);
    cells.push({ date: ymd(d), inMonth: false, day: d.getDate() });
  }
  for (let d = 1; d <= days; d += 1) {
    const dt = new Date(year, month, d);
    cells.push({ date: ymd(dt), inMonth: true, day: d });
  }
  while (cells.length % 7 !== 0) {
    const last = new Date(`${cells[cells.length - 1].date}T00:00:00`);
    last.setDate(last.getDate() + 1);
    cells.push({ date: ymd(last), inMonth: false, day: last.getDate() });
  }
  return cells;
}

export function CalendarPage() {
  const { state, sendReminder } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const cells = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const byDate = new Map<string, typeof state.hearings>();
  for (const h of state.hearings) {
    const list = byDate.get(h.date) ?? [];
    list.push(h);
    byDate.set(h.date, list);
  }

  const upcoming = [...state.hearings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHead title="Calendar" lede="Court dates, filing notices, and email reminders to the assigned lawyer.">
        <button className="btn" type="button" onClick={() => setCursor({ y: cursor.m === 0 ? cursor.y - 1 : cursor.y, m: cursor.m === 0 ? 11 : cursor.m - 1 })}>
          Prev
        </button>
        <strong>{label}</strong>
        <button className="btn" type="button" onClick={() => setCursor({ y: cursor.m === 11 ? cursor.y + 1 : cursor.y, m: cursor.m === 11 ? 0 : cursor.m + 1 })}>
          Next
        </button>
      </PageHead>

      <div className="cal" style={{ marginBottom: 20 }}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-h">
            {d}
          </div>
        ))}
        {cells.map((c) => (
          <div key={c.date} className={`cal-d ${c.inMonth ? "" : "out"}`}>
            {c.day}
            {(byDate.get(c.date) ?? []).map((h) => {
              const matter = state.matters.find((m) => m.id === h.matterId);
              return (
                <Link key={h.id} className="cal-event" to={`/matters/${h.matterId}`}>
                  {h.time} {matter?.id}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <section className="card">
        <div className="card-h">Court dates and filing notices</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Matter</th>
                <th>Court</th>
                <th>Notice</th>
                <th>Reminder</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((h) => {
                const matter = state.matters.find((m) => m.id === h.matterId);
                const lawyer = state.lawyers.find((l) => l.id === matter?.assignedLawyerId);
                return (
                  <tr key={h.id}>
                    <td>
                      {formatDate(h.date)} {h.time}
                    </td>
                    <td>
                      <Link to={`/matters/${h.matterId}`}>{matter?.id}</Link>
                      <div className="lede">{matter?.title}</div>
                    </td>
                    <td>{h.court}</td>
                    <td>{h.hearingNotice || "—"}</td>
                    <td>
                      {h.reminderSent ? (
                        <span className="pill pill-ok">Sent to {lawyer?.name}</span>
                      ) : (
                        <button className="btn" type="button" onClick={() => sendReminder(h.id)}>
                          Email {lawyer?.name.split(" ")[0]}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
