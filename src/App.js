import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AttendanceProvider } from "./context/AttendanceContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import StudentProfiles from "./pages/StudentProfiles";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import StudentPerformance from "./pages/StudentPerformance";
import NotFound from "./pages/NotFound";

function Pages() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/student-profiles" element={<StudentProfiles />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/student-performance" element={<StudentPerformance />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
            <Pages />
          </main>
          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </AttendanceProvider>
  );
}
