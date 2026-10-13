import { useMemo, useState } from "react";
import { useApp } from "../context/AttendanceContext";
import { DEPARTMENTS, YEARS } from "../data/initialData";
import { category, formatDate, groupBy, summarize, toCSV, YEAR_LABEL } from "../utils/attendanceUtils";
import ProgressBar, { Ring } from "../components/ProgressBar";

export default function Reports() {
  const { data, notify } = useApp();
  const [f, setF] = useState({ from: "", to: "", dept: "All", year: "All" });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const students = useMemo(
    () => data.students.filter((s) => (f.dept === "All" || s.department === f.dept) && (f.year === "All" || s.year === f.year)),
    [data.students, f.dept, f.year]
  );
  const records = useMemo(() => {
    const ids = new Set(students.map((s) => s.id));
    return data.attendance.filter((r) => ids.has(r.studentId) && (!f.from || r.date >= f.from) && (!f.to || r.date <= f.to));
  }, [data.attendance, students, f.from, f.to]);

  const overall = summarize(records);
  const rows = useMemo(() => {
    const by = groupBy(records, (r) => r.studentId);
    return students.map((s) => ({ s, ...summarize(by[s.id] || []) }));
  }, [students, records]);
  const subjects = useMemo(() => Object.entries(groupBy(records, (r) => r.subject || "General")).map(([name, recs]) => ({ name, ...summarize(recs) })).sort((a, b) => a.name.localeCompare(b.name)), [records]);
  const months = useMemo(() => Object.entries(groupBy(records, (r) => r.date.slice(0, 7))).map(([m, recs]) => ({ m, ...summarize(recs) })).sort((a, b) => a.m.localeCompare(b.m)), [records]);
  const trend = useMemo(() => Object.entries(groupBy(records, (r) => r.date)).map(([d, recs]) => ({ d, ...summarize(recs) })).sort((a, b) => a.d.localeCompare(b.d)).slice(-20), [records]);
  const low = rows.filter((r) => r.total > 0 && r.percent < 75).sort((a, b) => a.percent - b.percent);
  const counts = { Excellent: 0, Good: 0, Low: 0, Critical: 0 };
  rows.forEach((r) => { const c = category(r.percent, r.total).label; if (counts[c] !== undefined) counts[c] += 1; });

  const exportCSV = () => {
    if (rows.length === 0) return notify("There is nothing to export for these filters.", "error");
    const head = ["Student ID", "Name", "Department", "Year", "Present", "Late", "OD", "Absent", "Total days", "Attendance %", "Category"];
    const body = rows.map((r) => [r.s.id, r.s.name, r.s.department, YEAR_LABEL[r.s.year], r.Present, r.Late, r.OD, r.Absent, r.total, r.percent, category(r.percent, r.total).label]);
    const blob = new Blob([toCSV([head, ...body])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendance-report.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    notify("CSV report downloaded.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Attendance Reports and Analytics</h1>
          <p className="text-sm text-slate-500">Understand attendance patterns, identify students who need support, and review attendance performance.</p>
        </div>
        <div className="flex gap-2 print:hidden"><button className="btn-ghost" onClick={() => window.print()}>Print report</button><button className="btn-primary" onClick={exportCSV}>Export CSV</button></div>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <div><label className="label" htmlFor="r-from">From</label><input id="r-from" type="date" className="input" value={f.from} onChange={set("from")} /></div>
        <div><label className="label" htmlFor="r-to">To</label><input id="r-to" type="date" className="input" value={f.to} onChange={set("to")} /></div>
        <div><label className="label" htmlFor="r-dept">Department</label><select id="r-dept" className="input" value={f.dept} onChange={set("dept")}><option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div><label className="label" htmlFor="r-year">Class / year</label><select id="r-year" className="input" value={f.year} onChange={set("year")}><option value="All">All years</option>{YEARS.map((y) => <option key={y} value={y}>{YEAR_LABEL[y]}</option>)}</select></div>
      </div>

      {records.length === 0 ? (
        <div className="card py-10 text-center"><p className="font-bold">No attendance records for these filters</p><p className="mt-1 text-sm text-slate-500">Widen the date range or choose All departments.</p></div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="card flex items-center gap-4"><Ring value={overall.percent} size={88} /><div><p className="text-sm text-slate-500">Overall attendance</p><p className="text-xs text-slate-500">{overall.attended} of {overall.total} entries</p></div></div>
            <div className="card"><p className="text-sm text-slate-500">Present days (incl. late, OD)</p><p className="text-2xl font-extrabold">{overall.attended}</p></div>
            <div className="card"><p className="text-sm text-slate-500">Absent days</p><p className="text-2xl font-extrabold">{overall.Absent}</p></div>
            <div className="card text-sm"><p className="mb-1 text-slate-500">Students by category</p>{Object.entries(counts).map(([k, v]) => <p key={k} className="flex justify-between"><span>{k}</span><b>{v}</b></p>)}</div>
          </div>

          <section className="card">
            <h2 className="font-bold">Attendance trend</h2>
            <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label="Daily attendance trend">
              {trend.map((t) => (
                <div key={t.d} className="flex h-full flex-1 flex-col justify-end" title={`${formatDate(t.d)}: ${t.percent}%`}>
                  <div className="w-full rounded-t bg-gradient-to-t from-electric to-mist" style={{ height: `${t.percent}%` }} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatDate(trend[0].d)} to {formatDate(trend[trend.length - 1].d)}</p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card"><h2 className="font-bold">Subject-wise attendance</h2>
              <div className="mt-3 space-y-3">{subjects.map((s) => <div key={s.name}><div className="mb-1 flex justify-between text-sm"><span>{s.name}</span><b>{s.percent}%</b></div><ProgressBar value={s.percent} label={s.name} /></div>)}</div></section>
            <section className="card"><h2 className="font-bold">Monthly report</h2>
              <table className="mt-3 w-full"><thead><tr><th className="th">Month</th><th className="th">Present</th><th className="th">Absent</th><th className="th">%</th></tr></thead>
                <tbody>{months.map((m) => <tr key={m.m} className="border-t border-slate-100 dark:border-white/5"><td className="td">{new Date(`${m.m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</td><td className="td">{m.attended}</td><td className="td">{m.Absent}</td><td className="td font-bold">{m.percent}%</td></tr>)}</tbody></table></section>
          </div>

          <section className="card overflow-x-auto"><h2 className="font-bold">Student-wise attendance</h2>
            <table className="mt-3 w-full min-w-[560px]"><thead><tr>{["Student", "Present", "Absent", "Total", "%", "Category"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r) => { const c = category(r.percent, r.total); return (
                <tr key={r.s.id} className="border-t border-slate-100 dark:border-white/5"><td className="td font-semibold">{r.s.name}<span className="ml-2 text-xs font-normal text-slate-500">{r.s.id}</span></td><td className="td">{r.attended}</td><td className="td">{r.Absent}</td><td className="td">{r.total}</td><td className="td font-bold">{r.percent}%</td><td className="td"><span className={`badge ${c.cls}`}>{c.label}</span></td></tr>); })}</tbody></table></section>

          <section className="card"><h2 className="font-bold">Students who need support (below 75%)</h2>
            {low.length === 0 ? <p className="mt-2 text-sm text-slate-500">Every student in this view is at 75% or above.</p> : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/5">{low.map((r) => <li key={r.s.id} className="flex items-center justify-between py-2 text-sm"><span className="font-semibold">{r.s.name}</span><span className={`badge ${category(r.percent, r.total).cls}`}>{r.percent}% · {category(r.percent, r.total).label}</span></li>)}</ul>)}</section>
        </>
      )}
    </div>
  );
}
