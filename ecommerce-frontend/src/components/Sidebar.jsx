import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const linkClass =
  "block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white";
const activeClass = "bg-slate-800 text-white";

const Sidebar = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <aside className="h-full w-60 border-r border-slate-800 bg-slate-900 text-slate-200">
      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Navigation
      </div>
      <nav className="space-y-1 px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Orders
        </NavLink>

        {isAdmin && (
          <>
            <div className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin
            </div>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Products
            </NavLink>
            <NavLink
              to="/admin/inventory"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Inventory
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
