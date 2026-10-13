import { useApp } from "../context/AttendanceContext";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const tone = toast.type === "error" ? "bg-rose-600" : "bg-emerald-600";
  return (
    <div key={toast.id} role="status" aria-live="polite" className={`pop fixed bottom-4 right-4 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg print:hidden ${tone}`}>
      {toast.message}
    </div>
  );
}
