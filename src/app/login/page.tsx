'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please provide your administrative email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please provide your security password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        router.replace(redirectPath);
      } else {
        setErrorMessage(res.error || 'Authentication rejected. Verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141211] text-[#FAF7F0] flex flex-col justify-between selection:bg-[#B39458] selection:text-[#141211]">
      {/* Top Brand Bar */}
      <header className="px-6 py-6 border-b border-[#2E2B26]/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-[#B39458]/40 bg-[#24211D] flex items-center justify-center shadow-xs">
            <span className="font-serif font-bold text-sm text-[#E5C384]">M</span>
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-[0.18em] text-[#FAF7F0] block">
              MONARCH
            </span>
            <span className="text-[9px] font-sans text-[#8C877D] tracking-widest uppercase block -mt-0.5">
              Atelier Administration
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#A8A49C] bg-[#1E1B18] px-3 py-1.5 rounded-full border border-[#2E2B26]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3E7B54] animate-pulse" />
          <span>Sovereign Gateway v1.0.4 · 256-bit Encrypted</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md relative">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#B39458]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative bg-[#1A1816] border border-[#2E2B26] shadow-2xl rounded-sm p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#24211D] border border-[#B39458]/30 text-[#E5C384] text-[10px] font-mono tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B39458]" />
                <span>Restricted Atelier Terminal</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF7F0] tracking-wide pt-1">
                Operator Sign In
              </h1>
              <p className="text-xs text-[#8C877D] font-sans leading-relaxed">
                Enter your administrative credentials to access catalog management, order processing, and boutique operations.
              </p>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="bg-[#2D1619] border border-[#7D262D] p-3.5 rounded-sm flex items-start space-x-3 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-[#FCA5A5] leading-relaxed">
                  <span className="font-semibold block text-[#F87171]">Authentication Failed</span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#C5BFB5] uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736C]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@monarch-couture.in"
                    required
                    autoFocus
                    className="w-full bg-[#141211] border border-[#38342E] focus:border-[#B39458] rounded-sm pl-10 pr-4 py-2.5 text-xs text-[#FAF7F0] placeholder-[#57534D] focus:outline-none focus:ring-1 focus:ring-[#B39458] transition-all"
                  />
                </div>
              </div>

              {/* Security Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#C5BFB5] uppercase tracking-wider">
                    Security Password
                  </label>
                  <span className="text-[10px] text-[#77736C]">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736C]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#141211] border border-[#38342E] focus:border-[#B39458] rounded-sm pl-10 pr-10 py-2.5 text-xs text-[#FAF7F0] placeholder-[#57534D] focus:outline-none focus:ring-1 focus:ring-[#B39458] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#77736C] hover:text-[#C5BFB5] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Session Retention */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#8C877D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#141211] border-[#38342E] text-[#B39458] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#B39458]"
                  />
                  <span>Remember administrative session (7 days)</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#B39458] to-[#9B7940] hover:from-[#C9A96E] hover:to-[#B39458] text-[#141211] font-semibold text-xs tracking-wider uppercase py-3 px-4 rounded-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#141211] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Sovereign Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Sovereign Footer */}
      <footer className="px-6 py-4 border-t border-[#2E2B26]/60 text-center text-[11px] text-[#77736C] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 MONARCH Royal Haute Couture Atelier. Strictly Restricted Administration.</p>
        <div className="flex items-center space-x-3 text-[10px]">
          <span>Role-Based Access Control</span>
          <span>·</span>
          <span>Cryptographic JWT Validation</span>
          <span>·</span>
          <span>Audit Logging Active</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#141211] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-[#B39458]/40 bg-[#24211D] flex items-center justify-center animate-pulse">
            <span className="font-serif font-bold text-sm text-[#E5C384]">M</span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

