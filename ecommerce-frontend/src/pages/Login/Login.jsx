import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roles";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // login may return the raw axios response or the extracted data object,
      // handle both shapes.
      const resp = await login(email, password);
      const data = resp?.data ?? resp ?? {};

      // Try several locations for the role
      const roleRaw =
        data?.user?.role ||
        data?.role ||
        data?.user?.data?.role ||
        data?.roleName ||
        (data?.user ? data.user.role : undefined);

      const role = typeof roleRaw === "string" ? roleRaw.toUpperCase() : "";

      // If backend suggests a redirect path, prefer that
      const backendRedirect =
        data?.redirectTo || data?.defaultPage || data?.user?.defaultPage;

      if (backendRedirect) {
        navigate(backendRedirect, { replace: true });
        return;
      }

      if (role === ROLES.ADMIN || role === "ADMIN") {
        // Admin -> admin area (users page as admin dashboard)
        navigate("/admin/users", { replace: true });
      } else {
        // Non-admin -> fallback to original 'from' or dashboard
        navigate(from || "/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Sign in to <span className="text-indigo-400">MyERP</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <Link
              to="/register"
              className="text-indigo-400 hover:underline"
            >
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
