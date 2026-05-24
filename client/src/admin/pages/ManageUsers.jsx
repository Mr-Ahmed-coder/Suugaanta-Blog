import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, updateUserRole } from "../../api/services/userService";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner, EmptyState } from "../../components/common/FeedbackStates";

function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setFetching(true);
      const response = await getAllUsers();
      setUsers(response.data.users);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    // Prevent accidental self-demotion lockout on UI side as well
    if (userId === currentUser._id && newRole !== "admin") {
      alert("You cannot demote your own admin account. Please ask another admin to change your role if needed.");
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      await updateUserRole(userId, newRole);
      // Update local state to reflect the change
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setProcessingId(null);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-green-950">Manage Users</h1>
          <p className="mt-1 text-sm text-brand-green-800/80">Manage user roles and permissions.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          ⚠️ {error}
        </div>
      )}

      {users.length === 0 && !error ? (
        <EmptyState 
          title="No Users Found" 
          message="There are no registered users in the system."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brand-green-900">
              <thead className="bg-brand-cream/10 text-xs uppercase tracking-wider text-brand-green-950">
                <tr>
                  <th className="px-6 py-4 font-bold">User Name</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Current Role</th>
                  <th className="px-6 py-4 font-bold">Registered On</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-cream/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-brand-green-800/70">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          u.role === 'editor' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-green-800/70">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={processingId === u._id}
                        className="rounded-lg border border-brand-gold/30 bg-brand-cream/5 px-2 py-1.5 text-xs focus:border-brand-gold-dark focus:outline-none disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
