import { toISO } from "../utils/attendanceUtils";

export const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics"];
export const YEARS = ["1", "2", "3"];
export const STATUSES = ["Present", "Absent", "Late", "OD"];
export const SUBJECTS = ["Data Structures", "Database Systems", "Web Technology", "Operating Systems", "Python Programming"];

// name, dept index, year, target attendance %, marks (5 subjects), assignment %, skills, activities, achievements
const PEOPLE = [
  ["Aarav Sharma", 0, "3", 96, [88, 92, 85, 79, 90], 90, ["React", "JavaScript", "SQL"], ["Coding Club lead"], ["Hackathon finalist 2025"]],
  ["Diya Patel", 0, "3", 91, [76, 81, 88, 70, 84], 80, ["Python", "HTML/CSS"], ["NSS volunteer"], ["Python certificate (NPTEL)"]],
  ["Rohan Iyer", 1, "2", 84, [64, 58, 72, 61, 66], 65, ["Java", "Git"], ["Cricket team"], ["Inter-college cricket runner-up"]],
  ["Meera Nair", 1, "2", 93, [91, 89, 94, 87, 95], 95, ["Python", "Data analysis"], ["Debate society"], ["University rank holder"]],
  ["Karthik Raj", 0, "1", 72, [48, 55, 61, 44, 52], 50, ["HTML/CSS"], ["Photography club"], []],
  ["Ananya Das", 2, "2", 88, [70, 66, 74, 62, 79], 72, ["Embedded C", "Arduino"], ["Robotics club"], ["Project expo winner"]],
  ["Vikram Singh", 2, "3", 58, [42, 39, 51, 47, 45], 35, ["C", "Circuit design"], ["Sports volunteer"], []],
  ["Sneha Reddy", 1, "1", 95, [85, 90, 82, 88, 92], 92, ["Python", "Excel"], ["Cultural committee"], ["Poster presentation award"]],
  ["Imran Khan", 0, "1", 80, [67, 73, 69, 58, 71], 68, ["JavaScript", "Git"], ["Open-source meetup"], ["Git workshop certificate"]],
  ["Lakshmi Priya", 1, "3", 89, [82, 78, 90, 75, 86], 85, ["React", "Node basics", "MongoDB"], ["Women in Tech club"], ["Internship: web developer (3 months)"]],
];

function lastWeekdays(n) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(toISO(d));
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

/** Builds deterministic (not random) sample data so every page shows consistent numbers. */
export function buildDemoData() {
  const dates = lastWeekdays(24);
  const students = [];
  const attendance = [];
  const marks = {};
  const profiles = {};

  PEOPLE.forEach(([name, dept, year, rate, m, assign, skills, activities, achievements], i) => {
    const id = `STU${String(i + 1).padStart(3, "0")}`;
    const first = name.split(" ")[0].toLowerCase();
    students.push({
      id, name, department: DEPARTMENTS[dept], year,
      email: `${first}@demo.attendease.edu`,
      phone: `98400${String(10000 + i * 137).slice(-5)}`,
    });
    marks[id] = Object.fromEntries(SUBJECTS.map((s, k) => [s, m[k]]));
    profiles[id] = { assignments: assign, skills, activities, achievements };
    dates.forEach((date, j) => {
      const v = (i * 37 + j * 61 + 7) % 100;
      let status = "Absent";
      if (v < rate) status = v % 9 === 0 ? "Late" : v % 13 === 0 ? "OD" : "Present";
      attendance.push({ studentId: id, date, status, subject: SUBJECTS[j % SUBJECTS.length] });
    });
  });

  return { students, attendance, marks, profiles, isDemo: true };
}
