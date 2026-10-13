import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AttendanceContext";
import { DEPARTMENTS, SUBJECTS, YEARS } from "../data/initialData";
import { formatDate, summarize, todayISO, YEAR_LABEL } from "../utils/attendanceUtils";
import AttendanceTable from "../components/AttendanceTable";

export default function Attendance() {
  const { data, saveAttendance, notify } = useApp();
  const [date, setDate] = useState(todayISO());
  const [dept, setDept] = useState("All");
  const [year, setYear] = useState("All");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [draft, setDraft] = useState({});

  useEffect(() => { setDraft({}); }, [date]);

  const existing = useMemo(() => {
    const m = {};
    data.attendance.forEach((r) => { if (r.date === date) m[r.studentId] = r; });
    return m;
  }, [data.attendance, date]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.students
      .filter((s) => (dept === "All" || s.department === dept) && (year === "All" || s.year === year) &&
        (!term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)))
      .map((s) => ({ student: s, status: draft[s.id] || existing[s.id]?.status || "", saved: Boolean(existing[s.id]) }));
  }, [data.students, dept, year, q, draft, existing]);

  const totals = summarize(rows.filter((r) => r.status).map((r) => ({ status: r.status })));
  const changed = rows.filter((r) => draft[r.student.id] && draft[r.student.id] !== existing[r.student.id]?.status);

  const setStatus = (id, status) => setDraft((d) => ({ ...d, [id]: status }));
  const markAll = (status) => setDraft((d) => ({ ...d, ...Object.fromEntries(rows.map((r) => [r.student.id, status])) }));

  const save = () => {
    if (!date) return notify("Choose a date before saving.", "error");
    if (changed.length === 0) return notify("There are no changes to save.", "error");
    saveAttendance(changed.map((r) => ({ studentId: r.student.id, date, status: draft[r.student.id], subject })));
    setDraft({});
    notify(`Saved attendance for ${changed.length} student${changed.length > 1 ? "s" : ""} on ${formatDate(date)}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Manage Attendance</h1>
        <p className="text-sm text-slate-500">Record daily attendance and monitor each student's attendance status.</p>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><label className="label" htmlFor="a-date">Date</label><input id="a-date" type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="label" htmlFor="a-dept">Department</label>
          <select id="a-dept" className="input" value={dept} onChange={(e) => setDept(e.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div><label className="label" htmlFor="a-year">Class / year</label>
          <select id="a-year" className="input" value={year} onChange={(e) => setYear(e.target.value)}><option value="All">All years</option>{YEARS.map((y) => <option key={y} value={y}>{YEAR_LABEL[y]}</option>)}</select></div>
        <div><label className="label" htmlFor="a-sub">Subject</label>
          <select id="a-sub" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="label" htmlFor="a-q">Search student</label><input id="a-q" className="input" placeholder="Name or ID" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[["Present", totals.Present], ["Absent", totals.Absent], ["Late", totals.Late], ["On Duty (OD)", totals.OD]].map(([l, v]) => (
          <div key={l} className="card py-4"><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-extrabold">{v}</p></div>
        ))}
      </div>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{rows.length} students · {changed.length} unsaved change{changed.length === 1 ? "" : "s"}</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => markAll("Present")} disabled={rows.length === 0}>Mark all present</button>
            <button className="btn-primary" onClick={save} disabled={changed.length === 0}>Save attendance</button>
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No students match these filters. Change the department, year or search.</p>
        ) : <AttendanceTable rows={rows} onChange={setStatus} />}
      </section>
    </div>
  );
}
