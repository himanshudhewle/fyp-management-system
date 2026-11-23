import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Supervise students and review submissions</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Requests", "Review pending supervision requests", "/teacher/pending-requests"],
          ["Students", "View assigned student projects", "/teacher/assigned-students"],
          ["Files", "Review uploaded project files", "/teacher/files"],
        ].map(([title, description, path]) => (
          <Link key={title} to={path} className="card block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <h2 className="card-title">{title}</h2>
            <p className="card-subtitle mt-2">{description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-600">Open {title} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TeacherDashboard;
