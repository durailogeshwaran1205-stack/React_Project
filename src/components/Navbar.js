import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AttendanceContext";

const LINKS = [
  ["/", "Home"],
  ["/student-profiles", "Student Profiles"],
  ["/attendance", "Attendance"],
  ["/reports", "Reports"],
  ["/student-performance", "Student Performance"],
];

export default function Navbar() {
  const { theme, toggleTheme, resetDemo } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-electric/10 text-electric dark:bg-electric/25 dark:text-mist"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-navy-900/80 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-electric text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          AttendEase
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={linkCls}>{label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-ghost px-3" aria-label="Toggle light and dark mode">
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="grid h-9 w-9 place-items-center rounded-full bg-electric text-sm font-bold text-white" aria-haspopup="menu" aria-expanded={menu} aria-label="Profile menu">AD</button>
            {menu && (
              <div role="menu" className="pop absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-xl dark:border-white/10 dark:bg-navy-800">
                <p className="px-3 py-2 font-semibold">Demo Admin<span className="block text-xs font-normal text-slate-500">admin@demo.attendease.edu</span></p>
                <button role="menuitem" className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5"
                  onClick={() => { if (window.confirm("Replace all current data with the original demo data?")) resetDemo(); setMenu(false); }}>
                  Reset demo data
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setOpen((o) => !o)} className="btn-ghost px-3 lg:hidden" aria-label="Toggle navigation menu" aria-expanded={open}>☰</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 dark:border-white/10 lg:hidden" aria-label="Mobile">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={linkCls} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
