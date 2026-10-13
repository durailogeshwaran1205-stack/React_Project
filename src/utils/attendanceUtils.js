export const ATTENDED = ["Present", "Late", "OD"];
export const YEAR_LABEL = { 1: "I Year", 2: "II Year", 3: "III Year" };

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayISO = () => toISO(new Date());
export const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

/** Counts statuses. Percentage is 0 (never NaN) when there are no records. */
export function summarize(records) {
  const s = { Present: 0, Absent: 0, Late: 0, OD: 0 };
  records.forEach((r) => {
    if (s[r.status] !== undefined) s[r.status] += 1;
  });
  const total = s.Present + s.Absent + s.Late + s.OD;
  const attended = s.Present + s.Late + s.OD;
  return { ...s, total, attended, percent: total ? Math.round((attended / total) * 1000) / 10 : 0 };
}

export function category(percent, total = 1) {
  if (!total) return { label: "No data", cls: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" };
  if (percent >= 90) return { label: "Excellent", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" };
  if (percent >= 75) return { label: "Good", cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" };
  if (percent >= 60) return { label: "Low", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" };
  return { label: "Critical", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" };
}

export const STATUS_CLS = {
  Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  OD: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
};

export function groupBy(items, keyFn) {
  const map = {};
  items.forEach((item) => {
    const k = keyFn(item);
    (map[k] = map[k] || []).push(item);
  });
  return map;
}

export function average(nums) {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;
}

/** Safe LocalStorage read: returns null for missing, corrupt or wrongly-shaped data. */
export function loadState(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && Array.isArray(p.students) && Array.isArray(p.attendance) && p.marks && p.profiles) return p;
  } catch (err) {
    console.warn("Saved data could not be read; starting with demo data.", err);
  }
  return null;
}

export function toCSV(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}
