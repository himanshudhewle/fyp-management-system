import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerDemoAccount } from "../../lib/demoAuth";
import { getApiErrorMessage } from "../../lib/axios";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Enter your name, email, and a password of at least 6 characters.");
      return;
    }

    try {
      const account = await registerDemoAccount({ name, email, password, role });
      sessionStorage.setItem("fyp-user", JSON.stringify(account));
      setError("");
      setCreated(true);
    } catch (signupError) {
      setError(getApiErrorMessage(signupError));
    }
  };

  if (created) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold">✓</div>
          <h1 className="text-2xl font-bold text-slate-800">Account created</h1>
          <p className="mt-2 text-sm text-slate-500">Your {role} account is ready.</p>
          <button type="button" className="btn-primary w-full mt-6" onClick={() => navigate(`/${role}`)}>Continue</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">F</div>
          <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Join the FYP Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="signup-name">Full name</label>
            <input id="signup-name" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="signup-email">Email</label>
            <input id="signup-email" className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="signup-password">Password</label>
            <input id="signup-password" className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="signup-role">Role</label>
            <select id="signup-role" className="input" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">Create account</button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default SignUpPage;
