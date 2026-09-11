'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/account';
      router.push(redirect);
    }
    const tab = searchParams.get('tab');
    if (tab === 'register') setMode('register');
  }, [isAuthenticated, router, searchParams]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (mode === 'register' && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerMsg('');
    setIsSubmitting(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(form.email, form.password);
      } else {
        result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      }
      if (result.success) {
        const redirect = searchParams.get('redirect') || '/account';
        router.push(redirect);
      } else {
        setServerMsg(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', border: `1px solid ${errors[key] ? '#ef4444' : '#d1d5db'}`,
          borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = '#7c3aed'}
        onBlur={e => e.target.style.borderColor = errors[key] ? '#ef4444' : '#d1d5db'}
      />
      {errors[key] && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4 bg-stone-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xl p-5 sm:p-9 w-full max-w-md">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ebanzo</span>
          </Link>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Premium Personalized Gifts</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}); setServerMsg(''); }}
              style={{
                flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', borderRadius: 7,
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                background: mode === m ? '#7c3aed' : 'transparent',
                color: mode === m ? '#fff' : '#6b7280',
              }}
            >
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && field('name', 'Full Name', 'text', 'Your full name')}
          {field('email', 'Email Address', 'email', 'you@example.com')}
          {mode === 'register' && field('phone', 'Phone (optional)', 'tel', '10-digit mobile number')}
          {field('password', 'Password', 'password', mode === 'register' ? 'Min. 6 characters' : 'Enter your password')}
          {mode === 'register' && field('confirmPassword', 'Confirm Password', 'password', 'Re-enter password')}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#7c3aed', cursor: 'pointer' }}>Forgot password?</span>
            </div>
          )}

          {serverMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {serverMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '12px 0', background: isSubmitting ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
            }}
          >
            {isSubmitting ? '...' : mode === 'login' ? 'Login to Account' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setServerMsg(''); }}
            style={{ color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
