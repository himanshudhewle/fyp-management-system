import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateDemoAccount } from "../../lib/demoAuth";
import { getApiErrorMessage } from "../../lib/axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      const account = await authenticateDemoAccount({ email, password, role });
      sessionStorage.setItem("fyp-user", JSON.stringify(account));
      setError("");
      navigate(`/${account.role}`);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FYP Management</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <select id="role" className="input" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full">Sign in</button>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-sm text-blue-600 hover:text-blue-700"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          New to FYP Management?{" "}
          <button type="button" className="font-medium text-blue-600 hover:text-blue-700" onClick={() => navigate("/signup")}>
            Create account
          </button>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
