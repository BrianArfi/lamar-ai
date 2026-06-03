'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Cpu, 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Sparkles, 
  LogOut, 
  ArrowLeft,
  Activity,
  Menu,
  X,
  User,
  ChevronRight,
  Code,
  Loader2
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import { Badge } from '../components/ui/badge';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  tier?: string;
  onboardingComplete: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Guard check on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          // If onboarding is not complete, redirect them to /onboarding
          if (!data.user.onboardingComplete && pathname !== '/onboarding') {
            router.push('/onboarding');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  // Check for Dev Mode from query param or localStorage
  useEffect(() => {
    const saved = localStorage.getItem('career_ops_dev_mode') === 'true';
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('dev');
    
    if (urlParam === 'true') {
      localStorage.setItem('career_ops_dev_mode', 'true');
      setIsDevMode(true);
      toast.success('Developer Mode Enabled! 🚀', {
        description: 'Scraper Diagnostics menu is now visible.',
        id: 'dev-mode'
      });
      // Clean URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      setIsDevMode(saved);
    }
  }, []);

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (nextClicks >= 5) {
      const nextState = !isDevMode;
      setIsDevMode(nextState);
      localStorage.setItem('career_ops_dev_mode', String(nextState));
      setLogoClicks(0);
      
      if (nextState) {
        toast.success('Developer Mode Activated! 🚀', {
          description: 'Diagnostics panel unlocked in the sidebar.',
          duration: 4000
        });
      } else {
        toast.info('Developer Mode Deactivated.', {
          description: 'Diagnostics panel is now hidden.',
          duration: 3000
        });
      }
    } else if (nextClicks > 1) {
      toast.info(`Click logo ${5 - nextClicks} more times to ${isDevMode ? 'deactivate' : 'activate'} Dev Mode...`, {
        id: 'dev-clicks',
        duration: 1000
      });
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Signed out successfully.');
        router.push('/login');
      } else {
        // Fallback: clear client state and redirect
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        toast.success('Signed out successfully.');
        router.push('/login');
      }
    } catch {
      // Fallback
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      toast.success('Signed out successfully.');
      router.push('/login');
    }
  };

  // Base navigation
  const baseNavigation = [
    { name: 'Job Tracker', href: '/dashboard', icon: LayoutDashboard, isDev: false },
    { name: 'CV Tailoring', href: '/dashboard/cv', icon: FileText, isDev: false },
    { name: 'Story Bank', href: '/dashboard/stories', icon: BookOpen, isDev: false },
  ];

  // Optional navigation depending on Dev Mode
  const navigation = [
    ...baseNavigation,
    ...(isDevMode ? [{ name: 'Scraper Diagnostics', href: '/dashboard/diagnostics', icon: Activity, isDev: true }] : []),
    { name: 'ATS Auditor', href: '/dashboard/audit', icon: Sparkles, isDev: false }
  ];

  // Determine current breadcrumb
  const getCurrentPageName = () => {
    if (pathname === '/dashboard') return 'Job Tracker';
    if (pathname === '/dashboard/cv') return 'CV Tailoring Studio';
    if (pathname === '/dashboard/stories') return 'Story Bank';
    if (pathname === '/dashboard/diagnostics') return 'Scraper Diagnostics';
    if (pathname === '/dashboard/audit') return 'ATS Auditor';
    return 'Dashboard';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col">
        {/* Brand header */}
        <div 
          onClick={handleLogoClick}
          className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-zinc-800/20 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/10">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-zinc-100 block">
                Career-Ops
              </span>
              <span className="text-[10px] text-indigo-400 font-bold block">
                SaaS Dashboard
              </span>
            </div>
          </div>
          {isDevMode && (
            <Badge variant="success" className="animate-pulse px-2 py-0">
              <Code className="w-3.5 h-3.5 mr-0.5" /> DEV
            </Badge>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive 
                    ? 'bg-violet-500 text-black shadow-lg shadow-violet-500/10 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-black font-black' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.isDev && (
                  <Badge variant="primary" className="text-[9px] px-1.5 py-0 bg-violet-500/20 text-violet-400 border-violet-500/20 font-bold">
                    DEV
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-800/80 flex flex-col gap-2">
        <div className="px-4 py-2 border border-zinc-800 rounded-xl bg-zinc-900/30 relative overflow-hidden">
          {user?.tier === 'pro' && (
            <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-amber-500 to-amber-300 shadow-[0_0_8px_#f59e0b]" />
          )}
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Logged in as</p>
            {user?.tier === 'pro' && (
              <Badge variant="primary" className="text-[8px] px-1 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20 font-black tracking-widest uppercase shrink-0">
                👑 PRO
              </Badge>
            )}
          </div>
          <p className="text-xs font-bold text-zinc-200 truncate">{user?.fullName || 'Demo User'}</p>
          <p className="text-[9px] text-zinc-500 truncate">{user?.email || 'demo@career-ops.local'}</p>
        </div>
        {user?.tier !== 'pro' && (
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/auth/me', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tier: 'pro' })
                });
                if (res.ok) {
                  toast.success('Account Upgraded to Pro! 👑', {
                    description: 'Unlimited scans and custom tailoring unlocked.',
                  });
                  setTimeout(() => window.location.reload(), 1500);
                }
              } catch (e) {
                console.error("Failed to upgrade tier:", e);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse shrink-0 border-none"
          >
            Upgrade to Pro (Simulated)
          </button>
        )}
        <Link 
          href="/"
          className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-rose-455 hover:text-rose-300 rounded-xl hover:bg-rose-500/5 transition-all w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-xs text-zinc-400 font-medium tracking-wide">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
      
      {/* 1. Large Screen Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-800/80 bg-zinc-900/40 backdrop-blur shrink-0 flex-col justify-between h-screen sticky top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-850">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Responsive Sidebar Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-zinc-900 border-r border-zinc-800 animate-fade-in z-10">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4.5 right-4 p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* 3. Main content area with top bar header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Sticky Dashboard Top Bar Header */}
        <header className="h-16 border-b border-zinc-800/60 bg-zinc-900/20 backdrop-blur px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-xl cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop breadcrumbs navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="hover:text-zinc-200 transition-colors">Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-200 font-bold">{getCurrentPageName()}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/30 border border-zinc-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Secure Session</span>
            </div>
            
            {/* Profile Avatar Trigger placeholder */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-zinc-350">{user?.fullName || 'Demo User'}</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Content canvas with correct scrollbar behavior */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-zinc-950 to-zinc-900/50">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
