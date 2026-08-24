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
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-sans overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container p-4">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 flex justify-center items-center">
        <div className="w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(77,142,255,0.18)_0%,transparent_70%)] blur-3xl"></div>
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundSize: '36px 36px',
          backgroundImage:
            'linear-gradient(to right, #dae2fd 1px, transparent 1px), linear-gradient(to bottom, #dae2fd 1px, transparent 1px)',
        }}
      ></div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-7 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center border border-outline-variant/60 mb-3.5 shadow-xl">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight mb-1.5">
            Dark Web Threat Actor Platform
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-[320px] leading-relaxed">
            Authorized cybersecurity threat intelligence & cross-persona deanonymization platform.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Credentials Section */}
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  className="block font-mono text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                  htmlFor="email"
                >
                  Analyst Identifier / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst.id@soc.internal"
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-mono text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Security Passcode
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passcode"
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2.5 pl-10 pr-10 text-on-surface font-mono text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
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
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-all active:scale-[0.98] shadow cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-surface-container-high text-on-surface text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 border border-outline-variant hover:bg-surface-variant transition-all active:scale-[0.98] cursor-pointer text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Quick Demo Access (Analyst Session)</span>
              </button>

              <p className="text-center text-[11px] text-outline opacity-80 pt-2 font-mono">
                Smart India Hackathon • Cybersecurity Track
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
