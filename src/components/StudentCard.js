import { category, YEAR_LABEL } from "../utils/attendanceUtils";
import ProgressBar from "./ProgressBar";

export function Avatar({ name, size = "h-10 w-10" }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric to-mist text-sm font-bold text-navy-900`}>{initials}</span>;
}

export default function StudentCard({ student, summary, onView, onEdit, onDelete }) {
  const cat = category(summary.percent, summary.total);
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <Avatar name={student.name} />
        <div className="min-w-0">
          <p className="truncate font-bold">{student.name}</p>
          <p className="text-xs text-slate-500">{student.id} · {student.department} · {YEAR_LABEL[student.year]}</p>
        </div>
        <span className={`badge ml-auto ${cat.cls}`}>{cat.label}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>Attendance</span><span className="font-bold">{summary.percent}%</span>
      </div>
      <div className="mt-1"><ProgressBar value={summary.percent} label={`${student.name} attendance`} /></div>
      <div className="mt-4 flex gap-2">
        <button className="btn-ghost flex-1" onClick={() => onView(student)}>View</button>
        <button className="btn-ghost flex-1" onClick={() => onEdit(student)}>Edit</button>
        <button className="btn-ghost flex-1 text-rose-600" onClick={() => onDelete(student)}>Delete</button>
      </div>
    </div>
  );
}
