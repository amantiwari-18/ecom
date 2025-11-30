import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-bold tracking-tight">
          MyERP
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-200">
              {user.name || user.email}{" "}
              <span className="rounded bg-slate-700 px-2 py-0.5 text-xs uppercase">
                {user.role === ROLES.ADMIN ? "Admin" : "User"}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
