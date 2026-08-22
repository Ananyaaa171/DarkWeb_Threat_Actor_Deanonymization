'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('analyst.op74@dwd-soc.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.login({ username: email, password });
      if (res && res.token && typeof window !== 'undefined') {
        localStorage.setItem('dwd_auth_token', res.token);
        localStorage.setItem('dwd_auth_user', JSON.stringify(res));
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, using offline session:', err);
    } finally {
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login({ username: 'analyst.op74@dwd-soc.internal', password: 'demo' });
      if (res && res.token && typeof window !== 'undefined') {
        localStorage.setItem('dwd_auth_token', res.token);
        localStorage.setItem('dwd_auth_user', JSON.stringify(res));
      }
    } catch (err) {
      console.warn('Backend login unavailable:', err);
    } finally {
      setTimeout(() => {
        router.push('/dashboard');
      }, 200);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body-md overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container p-4">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(77,142,255,0.15)_0%,transparent_70%)] blur-3xl"></div>
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage:
            'linear-gradient(to right, #dae2fd 1px, transparent 1px), linear-gradient(to bottom, #dae2fd 1px, transparent 1px)',
        }}
      ></div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant mb-4 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5)]">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2 font-bold">
            Dark Web Deanonymizer
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">
            Secure authentication required to access the Intel Division platform.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Credentials Section */}
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="[ Enter your email ]"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-data-mono text-data-mono placeholder:text-outline-variant focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="[ Enter your password ]"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 pl-10 pr-10 text-on-surface font-data-mono text-data-mono placeholder:text-outline-variant focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-title-sm text-title-sm py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all font-semibold"
              >
                <span>{isLoading ? 'Authenticating...' : '[ Sign In ]'}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-surface-container-highest text-on-surface font-title-sm text-title-sm py-3 rounded-lg flex items-center justify-center gap-2 border border-outline-variant hover:bg-surface-variant transition-all active:scale-[0.98] font-semibold"
              >
                <span>[ Demo Login ]</span>
              </button>

              <p className="text-center font-body-sm text-[11px] text-on-surface-variant opacity-70 pt-1">
                Authorized cyber investigation platform • Smart India Hackathon
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
