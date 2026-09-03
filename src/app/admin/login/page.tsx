'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/lib/admin-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin@ebanzo.com');
  const [password, setPassword] = useState('ebanzo@admin2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(username, password);
      if (res.status === 'success') {
        localStorage.setItem('ebanzo_admin_token', res.data.token);
        localStorage.setItem('ebanzo_admin_user', JSON.stringify(res.data.user));
        router.push('/admin');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Cannot connect to backend server at http://127.0.0.1:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-lg shadow-violet-600/30 mb-3">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">EBANZO Studio Console</h1>
          <p className="text-xs text-stone-400 mt-1">
            Order fulfillment, UV laser print queue, and catalog operations
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-950/60 border border-rose-500/30 p-3 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-stone-500 focus:border-violet-500 focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-stone-500 focus:border-violet-500 focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            </div>
          </div>

          {/* Pre-seeded credentials hint */}
          <div className="rounded-xl bg-stone-950 p-3 border border-stone-800 text-[11px] text-stone-400">
            <span className="font-bold text-violet-400 block mb-0.5">Pre-seeded Credentials:</span>
            <span>Username: <code className="text-stone-300">admin@ebanzo.com</code></span><br />
            <span>Password: <code className="text-stone-300">ebanzo@admin2026</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Studio Console</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[10px] text-stone-500 flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Secured Session Authentication • Ebanzo Operations</span>
        </div>
      </div>
    </div>
  );
}
