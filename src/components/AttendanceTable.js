import { STATUSES } from "../data/initialData";
import { STATUS_CLS } from "../utils/attendanceUtils";
import { Avatar } from "./StudentCard";

/** rows: [{ student, status, saved }]  ·  onChange(studentId, status) */
export default function AttendanceTable({ rows, onChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th className="th">Student</th><th className="th">Record</th><th className="th">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, status, saved }) => (
            <tr key={student.id} className="border-b border-slate-100 dark:border-white/5">
              <td className="td">
                <div className="flex items-center gap-3"><Avatar name={student.name} size="h-8 w-8" />
                  <div><p className="font-semibold">{student.name}</p><p className="text-xs text-slate-500">{student.id}</p></div>
                </div>
              </td>
              <td className="td">{saved ? <span className="badge bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">Saved</span> : <span className="text-xs text-slate-400">Not marked</span>}</td>
              <td className="td">
                <select value={status} onChange={(e) => onChange(student.id, e.target.value)} aria-label={`Status for ${student.name}`}
                  className={`input w-36 font-semibold ${status ? STATUS_CLS[status] : ""}`}>
                  <option value="">Select</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s === "OD" ? "On Duty (OD)" : s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
