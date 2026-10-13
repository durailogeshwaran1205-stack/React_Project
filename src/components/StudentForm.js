import { useState } from "react";
import { DEPARTMENTS, YEARS } from "../data/initialData";
import { YEAR_LABEL } from "../utils/attendanceUtils";

const EMPTY = { name: "", department: DEPARTMENTS[0], year: "1", email: "", phone: "" };

export function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Enter the student's full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address, like name@college.edu.";
  if (!/^[0-9+\-\s]{8,15}$/.test(v.phone.trim())) e.phone = "Enter a phone number with 8 to 15 digits.";
  return e;
}

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ name: values.name.trim(), department: values.department, year: values.year, email: values.email.trim(), phone: values.phone.trim() });
    }
  };

  const field = (k, label, type = "text") => (
    <div>
      <label htmlFor={`f-${k}`} className="label">{label}</label>
      <input id={`f-${k}`} type={type} value={values[k]} onChange={set(k)} className="input" aria-invalid={Boolean(errors[k])} />
      {errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {field("name", "Full name")}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-dept" className="label">Department</label>
          <select id="f-dept" value={values.department} onChange={set("department")} className="input">
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-year" className="label">Year of study</label>
          <select id="f-year" value={values.year} onChange={set("year")} className="input">
            {YEARS.map((y) => <option key={y} value={y}>{YEAR_LABEL[y]}</option>)}
          </select>
        </div>
      </div>
      {field("email", "Email address", "email")}
      {field("phone", "Phone number", "tel")}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? "Save changes" : "Add student"}</button>
      </div>
    </form>
  );
}
