import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md text-center">
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">That address doesn't match any page in AttendEase.</p>
      <Link to="/" className="btn-primary mt-4">Go to Home</Link>
    </div>
  );
}
