import React, { useEffect, useState } from "react";
import { getAllUsers, createUser, deleteUser } from "../../api/users";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await createUser({ email, role });
      setEmail("");
      setRole("USER");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create, view, and remove application users.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Existing Users
            </h2>
            {loading && (
              <span className="text-xs text-slate-500">Loading users...</span>
            )}
          </div>
          {error && (
            <div className="mb-3 rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase text-slate-400">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 text-slate-100">
                      {u.email || u.name}
                    </td>
                    <td className="px-3 py-2 text-slate-200">{u.role}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-md border border-red-500/60 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-slate-500"
                      colSpan={3}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Create User
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="newuser@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Role
              </label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-1 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
