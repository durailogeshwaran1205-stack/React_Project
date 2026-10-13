import { useMemo, useState } from "react";
import { useApp } from "../context/AttendanceContext";
import { DEPARTMENTS, YEARS } from "../data/initialData";
import { category, summarize, YEAR_LABEL } from "../utils/attendanceUtils";
import Modal from "../components/Modal";
import StudentForm from "../components/StudentForm";
import StudentCard, { Avatar } from "../components/StudentCard";
import { Ring } from "../components/ProgressBar";

export default function StudentProfiles() {
  const { data, addStudent, updateStudent, deleteStudent, notify } = useApp();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [year, setYear] = useState("All");
  const [sort, setSort] = useState("name");
  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "view" | "delete", student }

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = data.students
      .filter((s) => (!term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)) &&
        (dept === "All" || s.department === dept) && (year === "All" || s.year === year))
      .map((s) => ({ s, sum: summarize(data.attendance.filter((r) => r.studentId === s.id)) }));
    list.sort((a, b) =>
      sort === "attendance" ? b.sum.percent - a.sum.percent : sort === "id" ? a.s.id.localeCompare(b.s.id) : a.s.name.localeCompare(b.s.name));
    return list;
  }, [data.students, data.attendance, q, dept, year, sort]);

  const close = () => setModal(null);
  const open = (type) => (student) => setModal({ type, student });

  const handleAdd = (values) => { addStudent(values); close(); notify(`${values.name} was added.`); };
  const handleEdit = (values) => { updateStudent(modal.student.id, values); close(); notify("Student details updated."); };
  const handleDelete = () => { deleteStudent(modal.student.id); notify(`${modal.student.name} was deleted.`); close(); };

  const viewSum = modal?.type === "view" ? summarize(data.attendance.filter((r) => r.studentId === modal.student.id)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Student Profiles</h1>
          <p className="text-sm text-slate-500">View and manage student information, academic details, and attendance records.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: "add" })}>+ Add student</button>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search by name or ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
          <option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="input" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year">
          <option value="All">All years</option>{YEARS.map((y) => <option key={y} value={y}>{YEAR_LABEL[y]}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort students">
          <option value="name">Sort by name</option><option value="id">Sort by ID</option><option value="attendance">Sort by attendance</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="font-bold">No students match your search</p>
          <p className="mt-1 text-sm text-slate-500">Clear the filters or add a new student.</p>
        </div>
      ) : (
        <>
          <div className="card hidden overflow-x-auto p-0 md:block">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 dark:border-white/10">
                {["Student", "Department", "Year", "Email", "Phone", "Working days", "Attendance", ""].map((h) => <th key={h} className="th">{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map(({ s, sum }) => {
                  const cat = category(sum.percent, sum.total);
                  return (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-white/5">
                      <td className="td"><div className="flex items-center gap-3"><Avatar name={s.name} /><div><p className="font-semibold">{s.name}</p><p className="text-xs text-slate-500">{s.id}</p></div></div></td>
                      <td className="td">{s.department}</td><td className="td">{YEAR_LABEL[s.year]}</td>
                      <td className="td">{s.email}</td><td className="td">{s.phone}</td><td className="td">{sum.total}</td>
                      <td className="td"><span className={`badge ${cat.cls}`}>{sum.percent}%</span></td>
                      <td className="td whitespace-nowrap">
                        <button className="btn-ghost px-2 py-1" onClick={() => open("view")(s)}>View</button>{" "}
                        <button className="btn-ghost px-2 py-1" onClick={() => open("edit")(s)}>Edit</button>{" "}
                        <button className="btn-ghost px-2 py-1 text-rose-600" onClick={() => open("delete")(s)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {rows.map(({ s, sum }) => <StudentCard key={s.id} student={s} summary={sum} onView={open("view")} onEdit={open("edit")} onDelete={open("delete")} />)}
          </div>
        </>
      )}

      {modal?.type === "add" && <Modal title="Add student" onClose={close}><StudentForm onSubmit={handleAdd} onCancel={close} /></Modal>}
      {modal?.type === "edit" && <Modal title="Edit student" onClose={close}><StudentForm initial={modal.student} onSubmit={handleEdit} onCancel={close} /></Modal>}
      {modal?.type === "delete" && (
        <Modal title="Delete student?" onClose={close}>
          <p className="text-sm">This removes <b>{modal.student.name}</b> and all of their attendance and marks. This can't be undone.</p>
          <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={close}>Keep student</button><button className="btn-danger" onClick={handleDelete}>Delete student</button></div>
        </Modal>
      )}
      {modal?.type === "view" && (
        <Modal title="Student profile" onClose={close} wide>
          <div className="flex flex-wrap items-center gap-5">
            <Avatar name={modal.student.name} size="h-16 w-16" />
            <div className="flex-1"><p className="text-xl font-extrabold">{modal.student.name}</p><p className="text-sm text-slate-500">{modal.student.id} · {modal.student.department} · {YEAR_LABEL[modal.student.year]}</p></div>
            <Ring value={viewSum.percent} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{modal.student.email}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold">{modal.student.phone}</dd></div>
            <div><dt className="text-slate-500">Working days recorded</dt><dd className="font-semibold">{viewSum.total}</dd></div>
            <div><dt className="text-slate-500">Present / Late / OD / Absent</dt><dd className="font-semibold">{viewSum.Present} / {viewSum.Late} / {viewSum.OD} / {viewSum.Absent}</dd></div>
          </dl>
        </Modal>
      )}
    </div>
  );
}
