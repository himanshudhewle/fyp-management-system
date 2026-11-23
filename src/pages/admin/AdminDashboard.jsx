import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the final year project system</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Students", "Manage student accounts", "/admin/students"],
          ["Teachers", "Manage supervisors and teachers", "/admin/teachers"],
          ["Projects", "Review and approve projects", "/admin/projects"],
        ].map(([title, description, path]) => (
          <Link key={title} to={path} className="card block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <h2 className="card-title">{title}</h2>
            <p className="card-subtitle mt-2">{description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-600">Open {title} →</span>
          </Link>
        ))}
      </div>
      <nav aria-label="Admin dashboard shortcuts" className="flex flex-wrap gap-3">
        <Link className="btn-outline" to="/admin/assign-supervisor">Assign supervisor</Link>
        <Link className="btn-outline" to="/admin/deadlines">Manage deadlines</Link>
      </nav>
    </section>
  );
};

export default AdminDashboard;
