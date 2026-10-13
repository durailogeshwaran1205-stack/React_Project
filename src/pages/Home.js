
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AttendanceContext";
import { fetchHolidays } from "../services/holidayApi";
import StatCard from "../components/StatCard";
import { Ring } from "../components/ProgressBar";
import {
  formatDate,
  groupBy,
  STATUS_CLS,
  summarize,
  todayISO,
} from "../utils/attendanceUtils";

function Holidays() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchHolidays(controller.signal);

        if (active) {
          setItems(list);
        }
      } catch (err) {
        if (!active || err.name === "AbortError") {
          return;
        }

        setItems([]);

        setError(
          err instanceof TypeError
            ? "Couldn't reach the holiday service. Check your connection."
            : err.message
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  const upcoming = useMemo(
    () =>
      items
        .filter((holiday) => holiday.date >= todayISO())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [items]
  );

  return (
    <section className="card">
      <h2 className="font-bold">Upcoming Holidays</h2>

      <p className="text-xs text-slate-500">
        Live from Calendarific API
      </p>

      <div className="mt-3 space-y-2">
        {loading &&
          [1, 2, 3].map((n) => (
            <div key={n} className="skeleton h-10" />
          ))}

        {!loading && error && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <p>{error}</p>

            <button
              type="button"
              className="btn-ghost mt-2 w-full"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && upcoming.length === 0 && (
          <p className="text-sm text-slate-500">
            No upcoming holidays found for this year.
          </p>
        )}

        {!loading &&
          !error &&
          upcoming.map((holiday) => (
            <div
              key={`${holiday.date}-${holiday.name}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5"
            >
              <span className="font-semibold">
                {holiday.name}
              </span>

              <span className="shrink-0 text-slate-500">
                {formatDate(holiday.date)}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data } = useApp();

  const { students, attendance } = data;
  const today = todayISO();

  const dates = useMemo(
    () =>
      [...new Set(attendance.map((record) => record.date))].sort(),
    [attendance]
  );

  const refDate = dates.includes(today)
    ? today
    : dates[dates.length - 1];

  const isToday = refDate === today;

  const day = useMemo(
    () =>
      summarize(
        attendance.filter((record) => record.date === refDate)
      ),
    [attendance, refDate]
  );

  const overall = useMemo(
    () => summarize(attendance),
    [attendance]
  );

  const trend = useMemo(() => {
    const recordsByDate = groupBy(
      attendance,
      (record) => record.date
    );

    return dates.slice(-10).map((date) => ({
      date,
      ...summarize(recordsByDate[date]),
    }));
  }, [attendance, dates]);

  const recent = useMemo(() => {
    const studentsById = Object.fromEntries(
      students.map((student) => [student.id, student])
    );

    return attendance
      .filter(
        (record) =>
          record.date === refDate &&
          studentsById[record.studentId]
      )
      .slice(0, 6)
      .map((record) => ({
        ...record,
        student: studentsById[record.studentId],
      }));
  }, [students, attendance, refDate]);

  const when = isToday
    ? "Today"
    : refDate
      ? formatDate(refDate)
      : "No data yet";

  const actions = [
    ["/attendance", "Mark Attendance"],
    ["/student-profiles", "View Students"],
    ["/reports", "Attendance Reports"],
    ["/student-performance", "Student Performance"],
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-electric p-8 text-white">
        <p className="text-sm text-mist">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h1 className="mt-2 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
          Manage Student Attendance Easily and Efficiently
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Monitor attendance, manage student records, and
          understand academic progress through one simple
          and intelligent dashboard.
        </p>

        <span className="badge mt-4 bg-white/15 text-white">
          Demo data · stored only in this browser
        </span>
      </section>

      <section>
        <h2 className="sr-only">
          Student Attendance Tracker statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Students"
            value={students.length}
            icon="users"
            hint="Enrolled"
          />

          <StatCard
            label="Present"
            value={day.Present + day.OD}
            icon="check"
            tone="bg-emerald-100 text-emerald-600"
            hint={`${when} (incl. OD)`}
          />

          <StatCard
            label="Absent"
            value={day.Absent}
            icon="x"
            tone="bg-rose-100 text-rose-600"
            hint={when}
          />

          <StatCard
            label="Late Arrivals"
            value={day.Late}
            icon="clock"
            tone="bg-amber-100 text-amber-600"
            hint={when}
          />

          <StatCard
            label="Average Attendance"
            value={Math.round(overall.percent)}
            suffix="%"
            icon="percent"
            hint="All recorded days"
          />
        </div>

        {!isToday && refDate && (
          <p className="mt-2 text-xs text-slate-500">
            No attendance has been marked for today yet.
            Showing the latest session ({formatDate(refDate)}).
          </p>
        )}
      </section>

      <section
        className="flex flex-wrap gap-3"
        aria-label="Quick actions"
      >
        {actions.map(([to, label], index) => (
          <Link
            key={to}
            to={to}
            className={
              index === 0 ? "btn-primary" : "btn-ghost"
            }
          >
            {label}
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="font-bold">Attendance Overview</h2>

          <p className="text-xs text-slate-500">
            Daily attendance % for the last {trend.length} sessions
          </p>

          {trend.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No records yet. Mark attendance to see the chart.
            </p>
          ) : (
            <div
              className="mt-4 flex h-44 items-end gap-2"
              role="img"
              aria-label="Bar chart of daily attendance percentage"
            >
              {trend.map((item) => (
                <div
                  key={item.date}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  <span className="text-[10px] text-slate-500">
                    {Math.round(item.percent)}
                  </span>

                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-electric to-mist transition-all duration-700"
                    style={{
                      height: `${Math.max(
                        0,
                        Math.min(100, item.percent)
                      )}%`,
                    }}
                  />

                  <span className="text-[10px] text-slate-500">
                    {item.date.slice(8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card flex flex-col items-center text-center">
          <h2 className="self-start font-bold">
            Attendance Summary
          </h2>

          <div className="my-4">
            <Ring value={day.percent} size={120} stroke={11} />
          </div>

          <p className="text-sm text-slate-500">
            {when}: {day.Present} present · {day.OD} OD ·{" "}
            {day.Late} late · {day.Absent} absent
          </p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card overflow-x-auto lg:col-span-2">
          <h2 className="font-bold">Recent Student Attendance</h2>

          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Nothing to show yet.
            </p>
          ) : (
            <table className="mt-3 w-full min-w-[420px]">
              <thead>
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Department</th>
                  <th className="th">Status</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((record) => (
                  <tr
                    key={`${record.studentId}-${record.date}`}
                    className="border-t border-slate-100 dark:border-white/5"
                  >
                    <td className="td font-semibold">
                      {record.student.name}
                    </td>

                    <td className="td">
                      {record.student.department}
                    </td>

                    <td className="td">
                      <span
                        className={`badge ${STATUS_CLS[record.status] || ""}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <Holidays />
      </div>

      <section className="card">
        <h2 className="font-bold">Recent Activity</h2>

        <ul className="mt-3 space-y-2 text-sm">
          {dates.slice(-4).reverse().map((date) => {
            const summary = summarize(
              attendance.filter(
                (record) => record.date === date
              )
            );

            return (
              <li
                key={date}
                className="flex justify-between gap-3"
              >
                <span>
                  Attendance recorded for {summary.total} students
                </span>

                <span className="shrink-0 text-slate-500">
                  {formatDate(date)} · {summary.percent}%
                </span>
              </li>
            );
          })}

          {dates.length === 0 && (
            <li className="text-slate-500">
              No activity yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
