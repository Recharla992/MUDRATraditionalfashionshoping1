import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, showToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      if (!email || !password) {
        showToast('Please enter your email and password.', 'error');
        return;
      }
      login(email);
    } else if (tab === 'register') {
      if (!name || !email) {
        showToast('Please provide your name and email.', 'error');
        return;
      }
      register(name, email, phone);
    } else if (tab === 'forgot') {
      if (!email) {
        showToast('Please enter your registered email address.', 'error');
        return;
      }
      showToast('Password reset link sent to your email.', 'success');
      setTab('login');
    }
  };

  const handleDemoCustomer = () => {
    login('radhika.sen@mudra.in', 'customer');
  };

  const handleDemoAdmin = () => {
    login('admin@mudra.in', 'admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#07172C]/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div className="relative bg-[#FAF8F5] border border-[#D4AF37]/30 rounded-xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        {/* Top Decorative Banner */}
        <div className="bg-[#0C2B4E] px-6 py-4 text-[#F3E8CE] flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1.5 border-2 border-[#E5B23A] ring-1 ring-[#D4AF37]/50 shadow-md overflow-hidden flex items-center justify-center shrink-0">
              <img src="/mudra-logo.png" alt="MUDRA" className="w-full h-full object-contain filter drop-shadow-[0_1px_5px_rgba(255,226,133,0.8)]" />
            </div>
            <div>
              <span className="font-heading font-black tracking-[0.14em] text-lg text-white block leading-tight">
                MUDRA Sanctuary
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5B23A] font-bold">Patron & Artisan Portal</span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-[#D9D0C3] hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E8E2D9] bg-white text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-center cursor-pointer transition-colors ${
              tab === 'login'
                ? 'text-[#0C2B4E] border-b-2 border-[#0C2B4E] bg-[#FAF8F5]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-center cursor-pointer transition-colors ${
              tab === 'register'
                ? 'text-[#0C2B4E] border-b-2 border-[#0C2B4E] bg-[#FAF8F5]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab('forgot')}
            className={`flex-1 py-3 text-center cursor-pointer transition-colors ${
              tab === 'forgot'
                ? 'text-[#0C2B4E] border-b-2 border-[#0C2B4E] bg-[#FAF8F5]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#2D3748] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Radhika Sen"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#2D3748] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#2D3748] mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                />
              </div>
            </div>
          )}

          {tab !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-[#2D3748]">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-[#0C2B4E] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors shadow-sm cursor-pointer mt-2"
          >
            {tab === 'login'
              ? 'Sign In to Account'
              : tab === 'register'
              ? 'Complete Registration'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="px-6 py-4 bg-[#EFEAE2] border-t border-[#E8E2D9] text-xs">
          <p className="text-[#718096] text-[11px] mb-2 font-medium">Quick Demo Sign In for Testing:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDemoCustomer}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-[#D9D0C3] text-[#0C2B4E] rounded text-[11px] font-medium cursor-pointer"
            >
              Customer Demo
            </button>
            <button
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-[#0C2B4E] hover:bg-[#07172C] text-[#D4AF37] border border-[#D4AF37] rounded text-[11px] font-medium cursor-pointer"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
