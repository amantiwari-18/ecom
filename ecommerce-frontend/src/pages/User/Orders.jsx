import React from "react";

const Orders = () => {
  // You can wire this up to a real endpoint when available.
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Orders</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-300">
          This is a placeholder orders page. Integrate with your backend order
          endpoints when they are ready.
        </p>
      </div>
    </div>
  );
};

export default Orders;
