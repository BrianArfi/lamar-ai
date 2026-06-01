'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cpu, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDevBypass, setShowDevBypass] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('register') === 'true') {
        setIsLogin(false);
      }
      if (params.get('dev') === 'true' || localStorage.getItem('career_ops_dev_mode') === 'true') {
        setShowDevBypass(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLogin && !fullName.trim())) {
      toast.warning('Form validation', { description: 'Please fill in all required fields.' });
      return;
    }

    if (password.length < 8) {
      toast.warning('Password Requirement', { description: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { fullName, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Authentication failed.');
      }

      toast.success(isLogin ? 'Welcome back! 👋' : 'Account created! 🎉', {
        description: isLogin ? 'Signed in successfully.' : 'Welcome to Career-Ops. Let\'s set up your profile!',
        duration: 3500
      });

      if (isLogin) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
      
    } catch (err: any) {
      toast.error('Authentication Error', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    toast.info('Accessing in Zero-Config Sandbox Mode', {
      description: 'Logged in as the default profile.',
      duration: 3000
    });
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden font-sans">
      
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none select-none" />

      {/* Brand logo header */}
      <Link href="/" className="flex items-center gap-3 mb-8 cursor-pointer select-none group relative z-10">
        <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-500/10 transition-transform group-hover:scale-115">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent block">
            Career-Ops
          </span>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
            AI Job Matchmaker
          </span>
        </div>
      </Link>

      {/* Main glassmorphic login card container */}
      <Card className="w-full max-w-md p-6 md:p-8 animate-fade-in relative z-10" glass={true}>
        <div className="text-center mb-6">
          <Badge variant="primary" className="mb-2 shadow-inner bg-violet-500/10 text-violet-400 border-violet-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Secure & Private
          </Badge>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-150">
            {isLogin ? 'Sign In to Dashboard' : 'Create an Account'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {isLogin 
              ? 'Enter email credentials to sync your active application board.' 
              : 'Create a private account to start matching your profile against jobs.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
          
          {/* Full Name input (Only for registration) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Carter" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button 
            variant="primary" 
            type="submit" 
            isLoading={loading}
            className="w-full py-3 shadow-lg shadow-violet-500/10 mt-2 font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isLogin ? 'Sign In to Board' : 'Get Started'}
          </Button>

          {/* Bypass sandbox button - dev only */}
          {showDevBypass && (
            <button 
              type="button"
              onClick={handleBypass}
              className="w-full py-3 border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/40 text-zinc-450 hover:text-zinc-350 font-bold rounded-xl transition-all cursor-pointer text-center block"
            >
              Developer Bypass (Mock Account)
            </button>
          )}
        </form>

        {/* Toggle between register and login screens */}
        <div className="mt-6 text-center select-none text-[11px] text-zinc-500 border-t border-zinc-900 pt-4 font-normal">
          {isLogin ? (
            <span>
              New to Career-Ops?{' '}
              <button 
                onClick={() => setIsLogin(false)}
                className="text-violet-400 font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button 
                onClick={() => setIsLogin(true)}
                className="text-violet-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </Card>

      {/* Footer copyright */}
      <footer className="absolute bottom-6 text-center text-[10px] text-zinc-700 select-none">
        <p>© 2026 Career-Ops. Secure, zero-config credentials auth.</p>
      </footer>
    </main>
  );
}
