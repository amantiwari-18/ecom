import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Card = ({ title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:bg-slate-900/80"
  >
    <div className="h-12 w-12 rounded-md bg-indigo-600" />
    <div className="text-sm font-semibold text-white">{title}</div>
    <div className="text-xs text-slate-400">{subtitle}</div>
  </button>
);

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = (user?.role || "").toString().toUpperCase() === "ADMIN";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Home</h1>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card
          title="Products"
          subtitle="View and manage products"
          onClick={() => navigate(isAdmin ? "/admin/products" : "/dashboard")}
        />

        <Card
          title="Inventory"
          subtitle="Track stock levels"
          onClick={() => navigate(isAdmin ? "/admin/inventory" : "/dashboard")}
        />

        <Card
          title="Categories"
          subtitle="Manage product categories"
          onClick={() => navigate(isAdmin ? "/admin/categories" : "/dashboard")}
        />
      </div>
    </div>
  );
};

export default Home;
