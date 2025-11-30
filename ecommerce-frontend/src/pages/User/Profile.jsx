import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMe } from "../../api/auth";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Profile</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        {loading && (
          <p className="mb-2 text-sm text-slate-400">Refreshing profile...</p>
        )}
        <div className="space-y-2 text-sm text-slate-200">
          <div>
            <span className="text-slate-400">Name: </span>
            <span>{user?.name || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400">Email: </span>
            <span>{user?.email || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400">Role: </span>
            <span>{user?.role || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
