import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildDemoData, SUBJECTS } from "../data/initialData";
import { loadState } from "../utils/attendanceUtils";
import { STORAGE_KEY, THEME_KEY } from "../constants";

const AttendanceContext = createContext(null);

function readTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) || "light";
  } catch (err) {
    return "light";
  }
}

export function AttendanceProvider({ children }) {
  const [data, setData] = useState(() => loadState(STORAGE_KEY) || buildDemoData());
  const [theme, setTheme] = useState(readTheme);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Could not save data to LocalStorage.", err);
    }
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      console.warn("Could not save theme.", err);
    }
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const addStudent = useCallback((values) => {
    setData((d) => {
      const max = d.students.reduce((m, s) => Math.max(m, parseInt(s.id.replace(/\D/g, ""), 10) || 0), 0);
      const id = `STU${String(max + 1).padStart(3, "0")}`;
      return {
        ...d,
        students: [...d.students, { ...values, id }],
        marks: { ...d.marks, [id]: Object.fromEntries(SUBJECTS.map((s) => [s, 0])) },
        profiles: { ...d.profiles, [id]: { assignments: 0, skills: [], activities: [], achievements: [] } },
      };
    });
  }, []);

  const updateStudent = useCallback((id, values) => {
    setData((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, ...values, id } : s)) }));
  }, []);

  const deleteStudent = useCallback((id) => {
    setData((d) => {
      const { [id]: removedMarks, ...marks } = d.marks;
      const { [id]: removedProfile, ...profiles } = d.profiles;
      return {
        ...d,
        students: d.students.filter((s) => s.id !== id),
        attendance: d.attendance.filter((r) => r.studentId !== id),
        marks,
        profiles,
      };
    });
  }, []);

  /** Upserts records: one record per student per date (prevents duplicates). */
  const saveAttendance = useCallback((entries) => {
    setData((d) => {
      const keys = new Set(entries.map((e) => `${e.studentId}|${e.date}`));
      const kept = d.attendance.filter((r) => !keys.has(`${r.studentId}|${r.date}`));
      return { ...d, attendance: [...kept, ...entries] };
    });
  }, []);

  const setMarks = useCallback((id, marks) => setData((d) => ({ ...d, marks: { ...d.marks, [id]: marks } })), []);
  const updateProfile = useCallback(
    (id, patch) => setData((d) => ({ ...d, profiles: { ...d.profiles, [id]: { ...d.profiles[id], ...patch } } })),
    []
  );
  const resetDemo = useCallback(() => {
    setData(buildDemoData());
    notify("Demo data restored.");
  }, [notify]);

  const value = useMemo(
    () => ({ data, theme, toast, notify, toggleTheme, addStudent, updateStudent, deleteStudent, saveAttendance, setMarks, updateProfile, resetDemo }),
    [data, theme, toast, notify, toggleTheme, addStudent, updateStudent, deleteStudent, saveAttendance, setMarks, updateProfile, resetDemo]
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useApp must be used inside <AttendanceProvider>");
  return ctx;
}
