'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, ShieldCheck, Plus, 
  Edit, Key, CheckCircle2, RefreshCw, X, Lock, Mail, User
} from 'lucide-react';
import { fetchAdminUsers, saveAdminUser, AdminUser } from '@/lib/admin-api';

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'operator'>('admin');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Store Configuration Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('499');
  const [shippingFee, setShippingFee] = useState('49');
  const [supportPhone, setSupportPhone] = useState('+91 99999 88888');
  const [supportEmail, setSupportEmail] = useState('hello@ebanzo.com');
  const [storeGst, setStoreGst] = useState('07AAAAA0000A1Z5');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetchAdminUsers().then((res) => {
      setUsers(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUserModal = (u?: AdminUser) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setUsername(u.username);
      setRole(u.role);
      setPassword('');
    } else {
      setEditingUser(null);
      setName('');
      setUsername('');
      setRole('admin');
      setPassword('');
    }
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      username,
      role,
      password: password || undefined,
    };

    await saveAdminUser(payload, editingUser?.id);
    setSaving(false);
    setModalOpen(false);
    setToastMessage(editingUser ? 'User credentials updated!' : 'New administrator created!');
    setTimeout(() => setToastMessage(''), 3000);
    loadUsers();
  };

  const handleSaveStoreConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Access Control & Configurations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Studio Settings & Team Roles
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage operator permissions, authentication credentials, and storefront fulfillment rules
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Users & Roles Table */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h3 className="font-bold text-base text-white">Administrator Accounts</h3>
            <p className="text-xs text-stone-400">Authorized operator logins with role-based access</p>
          </div>

          <button
            onClick={() => openUserModal()}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 shadow-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Admin User</span>
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Admin Name</th>
                  <th className="pb-3">Login Username / Email</th>
                  <th className="pb-3">Role Permission</th>
                  <th className="pb-3">Created Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary-950/80 border border-primary-500/30 flex items-center justify-center font-bold text-primary-300 text-xs">
                          {u.name ? u.name[0].toUpperCase() : 'A'}
                        </div>
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-stone-300">
                      {u.username}
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.role === 'superadmin'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : u.role === 'admin'
                          ? 'bg-primary-950/60 text-primary-300 border border-primary-500/30'
                          : 'bg-stone-900 text-stone-400 border border-stone-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 text-stone-400 text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Initial Seed'}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openUserModal(u)}
                        className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                        title="Edit user & password"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Store Fulfillment & Configuration Form */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-5">
        <div className="pb-3 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Storefront Fulfillment Parameters</h3>
            <p className="text-xs text-stone-400">Shipping thresholds, taxes, and customer helpline configurations</p>
          </div>
          {settingsSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveStoreConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-300 mb-1">Free Shipping Cart Minimum (₹)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-300 mb-1">Standard Shipping Fee (₹)</label>
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-300 mb-1">Support Helpline WhatsApp / Phone</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-300 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-300 mb-1">Studio GST Number</label>
            <input
              type="text"
              value={storeGst}
              onChange={(e) => setStoreGst(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-6 py-2.5 font-bold text-white hover:bg-primary-500 shadow-md transition-colors"
            >
              Save Store Settings
            </button>
          </div>
        </form>
      </div>

      {/* User Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="text-lg font-black text-white">
                {editingUser ? 'Edit Administrator' : 'Create Admin User'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Username / Email *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@ebanzo.com"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-semibold"
                >
                  <option value="superadmin">Superadmin (All Permissions)</option>
                  <option value="admin">Admin (Catalog, Orders, Inventory)</option>
                  <option value="operator">Operator (Print Queue & Orders Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {editingUser ? 'New Password (Leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl bg-stone-800 px-4 py-2 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-500 disabled:opacity-60 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
