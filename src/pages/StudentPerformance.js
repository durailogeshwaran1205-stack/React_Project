import { useMemo, useState } from "react";
import { useApp } from "../context/AttendanceContext";
import { SUBJECTS } from "../data/initialData";
import { average, summarize } from "../utils/attendanceUtils";
import ProgressBar, { Ring } from "../components/ProgressBar";
import { Avatar } from "../components/StudentCard";

function ListEditor({ title, items, onAdd, onRemove }) {
  const [text, setText] = useState("");
  const add = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v || items.includes(v)) return;
    onAdd(v);
    setText("");
  };
  return (
    <section className="card">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 && <p className="text-sm text-slate-500">Nothing added yet.</p>}
        {items.map((it) => (
          <span key={it} className="badge gap-1 bg-electric/10 text-electric dark:bg-electric/25 dark:text-mist">{it}
            <button onClick={() => onRemove(it)} aria-label={`Remove ${it}`} className="ml-1">✕</button></span>
        ))}
      </div>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add new" aria-label={`Add to ${title}`} />
        <button className="btn-primary" type="submit">Add</button>
      </form>
    </section>
  );
}

export default function StudentPerformance() {
  const { data, setMarks, updateProfile, notify } = useApp();
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState("");
  const [draft, setDraft] = useState(null); // marks being edited

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.students.filter((s) => !t || s.name.toLowerCase().includes(t) || s.id.toLowerCase().includes(t));
  }, [data.students, q]);

  const student = data.students.find((s) => s.id === selId) || data.students[0];
  if (!student) {
    return <div className="card py-10 text-center"><h1 className="font-bold">Student Performance and Progress</h1><p className="mt-1 text-sm text-slate-500">Add a student on the Student Profiles page to see performance here.</p></div>;
  }

  const marks = data.marks[student.id] || {};
  const profile = data.profiles[student.id] || { assignments: 0, skills: [], activities: [], achievements: [] };
  const att = summarize(data.attendance.filter((r) => r.studentId === student.id));
  const values = SUBJECTS.map((s) => Number(marks[s]) || 0);
  const avg = average(values);
  const weak = SUBJECTS.filter((s) => (Number(marks[s]) || 0) < 50);
  const editing = draft !== null;
  const tone = (m) => (m < 50 ? "bg-rose-500" : m < 75 ? "bg-amber-500" : "bg-emerald-500");

  const saveMarks = () => {
    const out = {};
    for (const s of SUBJECTS) {
      const n = Number(draft[s]);
      if (draft[s] === "" || Number.isNaN(n) || n < 0 || n > 100) return notify(`Marks for ${s} must be between 0 and 100.`, "error");
      out[s] = n;
    }
    setMarks(student.id, out);
    setDraft(null);
    notify("Marks updated.");
  };
  const pick = (id) => { setSelId(id); setDraft(null); };

  const summary = `${student.name} has an average of ${avg}% across ${SUBJECTS.length} subjects and ${att.total ? `${att.percent}% attendance` : "no attendance recorded yet"}. ` +
    (weak.length ? `Needs support in ${weak.join(", ")}.` : "No subjects are below 50%.") +
    (profile.skills.length ? ` Skills: ${profile.skills.join(", ")}.` : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Student Performance and Progress</h1>
        <p className="text-sm text-slate-500">Monitor academic results, technical skills, attendance, and extracurricular development.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="card lg:col-span-1">
          <input className="input" placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {list.map((s) => (
              <li key={s.id}><button onClick={() => pick(s.id)} className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm ${s.id === student.id ? "bg-electric/10 font-bold text-electric dark:bg-electric/25 dark:text-mist" : "hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                <Avatar name={s.name} size="h-7 w-7" />{s.name}</button></li>
            ))}
            {list.length === 0 && <li className="text-sm text-slate-500">No students found.</li>}
          </ul>
        </aside>

        <div className="space-y-6 lg:col-span-3">
          <section className="card flex flex-wrap items-center gap-5">
            <Avatar name={student.name} size="h-14 w-14" />
            <div className="flex-1"><p className="text-xl font-extrabold">{student.name}</p><p className="text-sm text-slate-500">{student.id} · {student.department}</p></div>
            <div className="text-center"><Ring value={avg} size={80} /><p className="mt-1 text-xs text-slate-500">Average marks</p></div>
            <div className="text-center"><Ring value={att.percent} size={80} /><p className="mt-1 text-xs text-slate-500">Attendance</p></div>
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Subject-wise marks</h2>
              {editing ? <div className="flex gap-2"><button className="btn-ghost" onClick={() => setDraft(null)}>Cancel</button><button className="btn-primary" onClick={saveMarks}>Save marks</button></div>
                : <button className="btn-ghost" onClick={() => setDraft(Object.fromEntries(SUBJECTS.map((s) => [s, String(marks[s] ?? 0)])))}>Edit marks</button>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SUBJECTS.map((s) => {
                const m = Number(marks[s]) || 0;
                return (
                  <div key={s} className={`rounded-xl border p-4 ${m < 50 ? "border-rose-300 dark:border-rose-500/40" : "border-slate-200 dark:border-white/10"}`}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">{s}</span>
                      {editing ? <input type="number" min="0" max="100" className="input w-20 py-1" value={draft[s]} onChange={(e) => setDraft((d) => ({ ...d, [s]: e.target.value }))} aria-label={`${s} marks`} /> : <b>{m}%</b>}</div>
                    <ProgressBar value={m} tone={tone(m)} label={`${s} marks`} />
                    {m < 50 && <p className="mt-2 text-xs font-semibold text-rose-600">Weak subject: below 50%</p>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="flex items-center justify-between text-sm"><h2 className="font-bold">Assignment progress</h2><b>{profile.assignments}%</b></div>
            <input type="range" min="0" max="100" value={profile.assignments} onChange={(e) => updateProfile(student.id, { assignments: Number(e.target.value) })} className="mt-3 w-full accent-electric" aria-label="Assignment progress" />
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            <ListEditor title="Technical skills" items={profile.skills} onAdd={(v) => updateProfile(student.id, { skills: [...profile.skills, v] })} onRemove={(v) => updateProfile(student.id, { skills: profile.skills.filter((x) => x !== v) })} />
            <ListEditor title="Extracurricular activities" items={profile.activities} onAdd={(v) => updateProfile(student.id, { activities: [...profile.activities, v] })} onRemove={(v) => updateProfile(student.id, { activities: profile.activities.filter((x) => x !== v) })} />
            <ListEditor title="Certificates and achievements" items={profile.achievements} onAdd={(v) => updateProfile(student.id, { achievements: [...profile.achievements, v] })} onRemove={(v) => updateProfile(student.id, { achievements: profile.achievements.filter((x) => x !== v) })} />
          </div>

          <section className="card"><h2 className="font-bold">Development summary</h2><p className="mt-2 text-sm leading-relaxed">{summary}</p></section>
        </div>
      </div>
    </div>
  );
}
