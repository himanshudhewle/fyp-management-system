import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Track your project and submissions</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Proposal", "Submit or update your project proposal", "/student/submit-proposal"],
          ["Supervisor", "View supervisor assignments", "/student/supervisor"],
          ["Files", "Upload and review project files", "/student/upload-files"],
        ].map(([title, description, path]) => (
          <Link key={title} to={path} className="card block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <h2 className="card-title">{title}</h2>
            <p className="card-subtitle mt-2">{description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-600">Open {title} →</span>
          </Link>
        ))}
      </div>
      <nav aria-label="Student dashboard shortcuts" className="flex flex-wrap gap-3">
        <Link className="btn-outline" to="/student/feedback">View feedback</Link>
        <Link className="btn-outline" to="/student/notifications">View notifications</Link>
      </nav>
    </section>
  );
};

export default StudentDashboard;
