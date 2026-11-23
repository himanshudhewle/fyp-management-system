import { useState } from "react";
import { Link } from "react-router-dom";
import { createDemoPasswordReset } from "../../lib/demoAuth";
import { getApiErrorMessage } from "../../lib/axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await createDemoPasswordReset(email);
      setResetUrl(token ? `/reset-password?token=${encodeURIComponent(token)}` : "");
      setRequested(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800">Reset password</h1>
        <p className="mt-2 mb-6 text-sm text-slate-500">Enter your email to request a password reset.</p>
        {requested ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {resetUrl ? (
              <>
                <p>Password reset is ready for {email}. This demo does not send email; use the link below.</p>
                <Link className="mt-3 inline-block font-medium underline" to={resetUrl}>Continue to reset password</Link>
              </>
            ) : (
              <p>No local account was found for this email.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="reset-email">Email</label>
              <input id="reset-email" className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Requesting..." : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/login" className="block mt-5 text-center text-sm text-blue-600 hover:text-blue-700">Back to sign in</Link>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
