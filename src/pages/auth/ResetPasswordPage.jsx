import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isDemoPasswordResetValid, resetDemoPassword } from "../../lib/demoAuth";
import { getApiErrorMessage } from "../../lib/axios";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [validToken, setValidToken] = useState(null);

  useEffect(() => {
    let active = true;
    isDemoPasswordResetValid(token)
      .then((valid) => {
        if (active) setValidToken(valid);
      })
      .catch((validationError) => {
        if (active) {
          setValidToken(false);
          setError(getApiErrorMessage(validationError));
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await resetDemoPassword(token, password);
      setError("");
      setConfirmed(true);
    } catch (resetError) {
      setError(getApiErrorMessage(resetError));
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800">Create new password</h1>
        {confirmed ? (
          <p className="mt-5 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">Password updated successfully.</p>
        ) : validToken === null ? (
          <p className="mt-5 text-sm text-slate-500">Checking reset link...</p>
        ) : !validToken ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-red-600">{error || "Reset link is invalid or expired."}</p>
            <Link to="/forgot-password" className="text-sm text-blue-600 underline">Request a new reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="label" htmlFor="new-password">New password</label>
              <input id="new-password" className="input" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full">Update password</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
        <Link to="/login" className="block mt-5 text-center text-sm text-blue-600 hover:text-blue-700">Back to sign in</Link>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
