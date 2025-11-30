import React from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-slate-200">
          Welcome back,{" "}
          <span className="font-semibold">
            {user?.name || user?.email || "User"}
          </span>
          .
        </p>
        <p className="mt-2 text-sm text-slate-400">
          This is your central overview. From here you can access your profile,
          orders, and (if you are an admin) the management sections.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
