'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  CheckCircle,
  FileText,
  Briefcase,
  Zap,
  BookmarkCheck,
  Layers,
  ArrowUpRight,
  Calculator,
  ScanLine,
  TrendingDown,
  Building,
  Target,
  Flame,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';

export default function PremiumLandingPage() {
  // Simulator States
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculator States
  const [salary, setSalary] = useState(120000);
  const [weeksSearched, setWeeksSearched] = useState(8);

  // Canvas Ref for Background Moving Tech Nodes
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stats Countdown FOMO
  const [slotsLeft, setSlotsLeft] = useState(14);

  // Active Authenticated Session State
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Dynamically slowly decrease slots left to add micro-FOMO
    const timer = setInterval(() => {
      setSlotsLeft(prev => (prev > 3 ? prev - 1 : prev));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (e) {
        console.error("Auth check failed on landing page:", e);
      }
    }
    checkAuth();
  }, []);

  // Background Canvas particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates for interactive node drift
    const mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Define particles
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        baseRadius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(167, 139, 250, 0.45)' : i % 3 === 1 ? 'rgba(217, 70, 239, 0.35)' : 'rgba(99, 102, 241, 0.35)'
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle techy matrix grids in background
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw Particles
      particles.forEach((p, idx) => {
        // Interactivity: repulsion from cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
        }

        // Float drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse size slightly based on distance to cursor
        if (dist < mouse.radius) {
          p.radius = p.baseRadius + (1 - dist / mouse.radius) * 1.5;
        } else {
          p.radius = p.baseRadius;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = dist < mouse.radius ? 8 : 0;
        ctx.shadowColor = 'rgba(167, 139, 250, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw connections
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 140) {
            const alpha = (1 - cdist / 140) * 0.14;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Simulator Drag Events
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const newPos = Math.max(0, Math.min(100, (touchX / rect.width) * 100));
    setSliderPosition(newPos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const newPos = Math.max(0, Math.min(100, (clientX / rect.width) * 100));
    setSliderPosition(newPos);
  };

  // Opportunity Cost Computations
  const weeklySalary = salary / 52;
  const lostIncome = weeklySalary * weeksSearched;
  const averageJobSearchWeeks = 22; // National average for white collar roles
  const projectedLoss = weeklySalary * averageJobSearchWeeks;
  const careerOpsSavedIncome = weeklySalary * (weeksSearched * 0.6); // 60% accelerated search duration

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans relative">
      
      {/* Dynamic interactive tech background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Futuristic Ambient Glowing Auras */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-violet-500/8 to-fuchsia-500/3 rounded-full blur-[140px] pointer-events-none select-none" />
      <div className="absolute top-[35%] left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-fuchsia-500/4 rounded-full blur-[130px] pointer-events-none select-none" />

      {/* Global Navbar Header */}
      <header className="border-b border-zinc-900/60 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-indigo-500 p-2 rounded-xl shadow-lg shadow-violet-500/10">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent block">
              Career-Ops
            </span>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
              AI Job Search Co-Pilot
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button 
                variant="primary"
                size="sm"
                className="shadow-lg shadow-violet-500/10 bg-violet-600 hover:bg-violet-500 text-zinc-50 border-none px-4 rounded-xl flex items-center gap-1.5 font-bold"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-zinc-450 hover:text-zinc-200 transition-colors">
                Sign In
              </Link>
              <Link href="/login?register=true">
                <Button 
                  variant="primary"
                  size="sm"
                  className="shadow-lg shadow-violet-500/10 bg-violet-600 hover:bg-violet-500 text-zinc-50 border-none px-4 rounded-xl flex items-center gap-1.5 font-semibold"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full max-w-5xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center gap-6 z-10 select-none">
        
        {/* Dynamic Trust Glow Tag */}
        <Badge variant="primary" className="py-1.5 px-4 bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-inner flex items-center gap-2 rounded-full text-[10px] tracking-wider uppercase font-bold animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
          <span>Bypassing Automated Recruiter Filters Securely</span>
        </Badge>
        
        {/* FOMO White-Collar Title */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-450 bg-clip-text text-transparent">
          Job Hunting is Broken.<br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            We Reverse-Engineered It.
          </span>
        </h1>
        
        {/* Supporting White Collar Body Copy */}
        <p className="text-zinc-400 text-xs md:text-base leading-relaxed max-w-2xl font-sans font-medium px-4">
          Stop blindly emailing hundreds of resumes into the black hole of HR databases. Career-Ops is the elite sandboxed AI co-pilot designed to reverse-engineer automated applicant tracking filters, discover hidden vacancies, and tailor application layouts instantly.
        </p>

        {/* Dynamic CTA Layer */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="px-10 py-4 shadow-xl shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 border-none rounded-xl scale-105 font-bold flex items-center gap-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Go to Dashboard Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login?register=true">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="px-8 py-4 shadow-xl shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 border-none rounded-xl scale-105"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Access Engine Sandbox
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="px-8 py-4 border-zinc-800 hover:bg-zinc-900/60 text-zinc-350 rounded-xl">
                    Open Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Real-time cohort slots availability indicator */}
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-zinc-550">
            <Flame className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>Active invite-only cohort: <strong className="text-fuchsia-400">{slotsLeft} slots</strong> remaining today.</span>
          </div>
        </div>

      </section>

      {/* SECTION 2: INTERACTIVE "AI CV OPTIMISER" SIMULATOR */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12 z-10 relative">
        <div className="text-center space-y-3 mb-10 select-none">
          <Badge variant="primary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 font-bold uppercase tracking-widest text-[9px] rounded-md px-3 py-1">
            Core Engine Preview
          </Badge>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-zinc-150">
            The Interactive Tailoring Simulator
          </h2>
          <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Drag the glowing violet slider back and forth to see how Career-Ops dynamically sweeps raw experience text into structured, high-compatibility bullet points.
          </p>
        </div>

        {/* Simulator Workspace Container */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="w-full max-w-4xl mx-auto border border-zinc-850 bg-zinc-950/60 rounded-3xl p-2.5 backdrop-blur-sm shadow-2xl relative select-none overflow-hidden touch-none"
        >
          {/* Comparison Container */}
          <div className="w-full aspect-[16/8.5] min-h-[340px] md:min-h-[420px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 flex relative">
            
            {/* 1. LEFT SIDE: RAW UNSTRUCTURED CV (BACKGROUND LAYER) */}
            <div className="absolute inset-0 w-full h-full bg-zinc-950 p-6 md:p-10 flex flex-col justify-between select-none">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-350">Alex Carter</h3>
                    <p className="text-[10px] text-zinc-500">Alex.Carter@example.com | San Francisco, CA</p>
                  </div>
                  <Badge variant="primary" className="bg-rose-500/10 text-rose-455 border-rose-500/20 px-3 py-1 text-xs font-mono font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse">
                    32% ATS Match score
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-400 border-b border-zinc-900 pb-1 mb-2 uppercase tracking-wide">Work History</h4>
                    <div className="space-y-3 font-mono text-[10.5px] leading-relaxed text-zinc-500">
                      <p className="font-bold text-zinc-400">Software Developer at TechCorp (2024 - Present)</p>
                      <div className="space-y-1.5 pl-3">
                        <p className="bg-rose-500/5 border-l-2 border-rose-500/20 px-2 text-zinc-550">
                          - I worked on the main website using TypeScript and React to add new features.
                          <span className="text-rose-400 font-bold block text-[9.5px] mt-0.5">⚠️ Recruiter Trap: Lacks quantitative impact metrics</span>
                        </p>
                        <p className="bg-rose-500/5 border-l-2 border-rose-500/20 px-2 text-zinc-550">
                          - Fixed bugs in the API database code so it would load correctly.
                          <span className="text-rose-400 font-bold block text-[9.5px] mt-0.5">⚠️ Parser Issue: Vague skill descriptors (database brand not indexed)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Missing Vacancy Keywords (Severe Risk)</h5>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Kubernetes', 'PostgreSQL', 'ATS Layout Anchors', 'Docker Orchestration'].map(kw => (
                        <span key={kw} className="px-2 py-0.5 border border-rose-500/10 bg-rose-500/5 text-rose-455 text-[9px] font-semibold rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-[10px] text-zinc-650 italic">
                Raw profile draft loaded. Evaluator scanned 4 structural warning triggers.
              </div>
            </div>

            {/* 2. RIGHT SIDE: AI TAILORED OPTIMIZED CV (FOREGROUND SLIDE LAYER) */}
            <div 
              className="absolute inset-y-0 right-0 h-full bg-zinc-950 p-6 md:p-10 flex flex-col justify-between overflow-hidden border-l border-zinc-900"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Inner container shifted left to remain absolute to parent */}
              <div 
                className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between bg-zinc-950"
                style={{ width: `${containerRef.current?.getBoundingClientRect().width || 800}px` }}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-1.5">
                        Alex Carter
                        <Badge variant="primary" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[8px] py-0 px-1.5 uppercase font-black">
                          Master CV Opt
                        </Badge>
                      </h3>
                      <p className="text-[10px] text-zinc-450">Alex.Carter@example.com | San Francisco, CA | linkedin.com/in/alexcarter</p>
                    </div>
                    <Badge variant="primary" className="bg-emerald-500/10 text-emerald-450 border-emerald-500/20 px-3 py-1 text-xs font-mono font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
                      98% ATS Compliance score
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-200 border-b border-zinc-800 pb-1 mb-2 uppercase tracking-wide">Professional Experience</h4>
                      <div className="space-y-3 font-mono text-[10.5px] leading-relaxed text-zinc-400">
                        <p className="font-bold text-zinc-300">Software Developer at TechCorp (2024 - Present)</p>
                        <div className="space-y-1.5 pl-3">
                          <p className="bg-emerald-500/5 border-l-2 border-emerald-500/30 px-2 text-zinc-350">
                            - Engineered responsive frontends using <strong className="text-violet-400">TypeScript</strong> and <strong className="text-violet-400">React/Next.js</strong>, optimizing client-side render cycles to improve Core Web Vitals (FCP) by <strong className="text-emerald-450">34%</strong>.
                          </p>
                          <p className="bg-emerald-500/5 border-l-2 border-emerald-500/30 px-2 text-zinc-350">
                            - Re-architected data ingestion layers using <strong className="text-violet-400">PostgreSQL</strong> and Redis, resolving indexing locks and reducing average API database response latencies by <strong className="text-emerald-450">120ms</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Resolved Vacancy Gaps (Fully Parsable)</h5>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['Kubernetes Infrastructure', 'PostgreSQL Indexing', 'ATS Schema Standard', 'Container Docker Orchestration'].map(kw => (
                          <span key={kw} className="px-2 py-0.5 border border-emerald-500/10 bg-emerald-500/5 text-emerald-450 text-[9px] font-semibold rounded flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All warning blocks resolved. Structured STAR schemas compiled successfully.</span>
                </div>
              </div>
            </div>

            {/* 3. CENTER NEON GLOW LASER SLIDER LINE */}
            <div 
              className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-indigo-500 z-30 shadow-[0_0_10px_#a78bfa]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div 
                onMouseDown={() => setIsDragging(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center cursor-ew-resize hover:border-violet-500 shadow-xl shadow-black z-40 transition-colors"
              >
                <ScanLine className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: THE RECRUITER TRAP - WHY CAREER-OPS? */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 border-t border-zinc-900/50 flex flex-col gap-12 relative z-10">
        <div className="text-center space-y-3 select-none">
          <Badge variant="primary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold uppercase tracking-widest text-[9px] rounded-md px-3 py-1">
            The Hard Reality
          </Badge>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-zinc-150">
            Why White-Collar Job Hunting is Broken
          </h2>
          <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Recruiting departments use bots to throw away 95% of resumes. Here is how Career-Ops gives you an unfair advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "The Recruiter Bot Trap",
              desc: "Modern HR departments use automated parsing algorithms that reject profiles containing custom font columns or missing precise keyword maps. Career-Ops evaluates your master resume against exact recruiter rules before you apply.",
              icon: AlertTriangle,
              color: "border-rose-500/10 bg-rose-500/5 text-rose-455"
            },
            {
              title: "Client-Side Decoy Scraping",
              desc: "Job boards (LinkedIn, Glints) utilize Cloudflare anti-bot security that blocks standard scrapers. Our local Chrome extension acts like a human browser user, importing lists silently and bypassing CAPTCHAs safely.",
              icon: Globe,
              color: "border-cyan-500/10 bg-cyan-500/5 text-cyan-400"
            },
            {
              title: "Accelerated Search Pipelines",
              desc: "Stop wasting months tracking applications on messy spreadsheets. Standardize columns into a native Kanban flow, customize CV variants in 1-click, and build perfect STAR metrics that land interviews 10x faster.",
              icon: TrendingDown,
              color: "border-violet-500/10 bg-violet-500/5 text-violet-400"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className={`p-6 md:p-8 flex flex-col gap-4 border relative ${item.color}`} glass={false}>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 w-max shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-200 tracking-wide uppercase tracking-wider">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans font-medium">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE OPPORTUNITY COST CALCULATOR */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12 z-10 relative">
        <div className="w-full max-w-4xl mx-auto border border-zinc-850 bg-zinc-950/40 rounded-3xl p-6 md:p-10 backdrop-blur-sm shadow-2xl relative select-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Calculator Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="primary" className="bg-amber-500/10 text-amber-450 border-amber-500/20 font-bold uppercase tracking-widest text-[8px] rounded-md px-2 py-0.5">
                  Live Opportunity Cost Calculator
                </Badge>
                <h3 className="text-xl md:text-2xl font-extrabold text-zinc-100">
                  The True Cost of a Delayed Job Search
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Every week you spend searching without a co-pilot represents lost income. Calculate the financial cost of waiting to try Career-Ops.
                </p>
              </div>

              {/* Slider 1: Annual Salary */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-zinc-450 tracking-wider">
                  <span>Target Annual Salary</span>
                  <span className="text-violet-400 font-mono font-extrabold">${salary.toLocaleString()} USD</span>
                </div>
                <input 
                  type="range" 
                  min="40000" 
                  max="250000" 
                  step="5000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[9px] font-bold text-zinc-600 font-mono">
                  <span>$40k</span>
                  <span>$150k</span>
                  <span>$250k+</span>
                </div>
              </div>

              {/* Slider 2: Weeks spent searching */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-zinc-450 tracking-wider">
                  <span>Weeks Spent Searching</span>
                  <span className="text-fuchsia-400 font-mono font-extrabold">{weeksSearched} Weeks</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="26" 
                  step="1"
                  value={weeksSearched}
                  onChange={(e) => setWeeksSearched(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
                <div className="flex justify-between text-[9px] font-bold text-zinc-600 font-mono">
                  <span>2 weeks</span>
                  <span>14 weeks</span>
                  <span>26 weeks (6 months)</span>
                </div>
              </div>
            </div>

            {/* Calculator Computations Outputs */}
            <Card className="p-6 border-zinc-850 bg-zinc-950/60 shadow-inner flex flex-col gap-5 justify-between h-full" glass={false}>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-2 border-b border-zinc-900">
                  Financial Projections Summary
                </h4>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-zinc-500" />
                      Current Lost Income:
                    </span>
                    <span className="font-bold text-rose-455 font-mono text-sm">${Math.floor(lostIncome).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-zinc-500" />
                      Typical Search Loss (22 wks):
                    </span>
                    <span className="font-bold text-zinc-300 font-mono">${Math.floor(projectedLoss).toLocaleString()}</span>
                  </div>

                  <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <div>
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide block">Career-Ops Advantage</span>
                        <span className="text-[9.5px] text-zinc-400 leading-none">60% acceleration rate</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-450 font-mono text-sm shrink-0">+${Math.floor(careerOpsSavedIncome).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-zinc-900 text-center">
                <p className="text-[9.5px] text-zinc-550 leading-relaxed max-w-xs mx-auto">
                  By cutting search duration from 22 weeks to 8.8 weeks, Career-Ops saves you ${Math.floor(careerOpsSavedIncome).toLocaleString()} in potential lost wages.
                </p>
                <Link href={user ? "/dashboard" : "/login?register=true"} className="block w-full">
                  <Button variant="primary" size="sm" className="w-full py-2.5 font-bold shadow-md shadow-violet-500/5">
                    {user ? "Go to Workspace Dashboard" : "Recover My Lost Income"}
                  </Button>
                </Link>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* SECTION 5: LINEAR-STYLE FEATURE MATRIX GRID */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 border-t border-zinc-900/50 flex flex-col gap-12 relative z-10 select-none">
        <div className="text-center space-y-3">
          <Badge variant="primary" className="bg-violet-500/10 text-violet-400 border-violet-500/20 font-bold uppercase tracking-widest text-[9px] rounded-md px-3 py-1">
            Feature Catalog
          </Badge>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-zinc-150">
            Engineered for High-Growth Careers
          </h2>
          <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Everything you need to successfully execute a modern, complex white-collar search campaign in one dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              title: "AI Resume Auditor",
              desc: "Verify structural ATS anchors, duplicate sections, formatting blocks, and alignment index levels instantly in a secure sandboxed validator.",
              icon: ShieldCheck
            },
            {
              title: "Dynamic Role matching",
              desc: "Feed your parsed resume once to query professional target role alignments automatically using customized LLM keyword algorithms.",
              icon: Target
            },
            {
              title: "Anti-Scraping Decoy Sync",
              desc: "Bypass anti-bot firewalls on recruitment portals by acting as a native chrome user with our responsive client extension sync.",
              icon: Globe
            },
            {
              title: "Kanban Pipeline tracker",
              desc: "Manage multiple candidate targets seamlessly. Move applications using smooth native HTML5 drag-and-drop actions.",
              icon: Layers
            },
            {
              title: "STAR Narrative Builder",
              desc: "Analyze and structure Situation, Task, Action, and Reflection matrices mapped to target job requirements with simple AI prompts.",
              icon: BookmarkCheck
            },
            {
              title: "Client-Side Decrypt",
              desc: "We prioritize user privacy. Personal details (phone, email, location preferences) are kept securely inside your local workspace.",
              icon: Zap
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 flex flex-col gap-3 bg-zinc-900/20 hover:border-zinc-800 transition-all duration-350" glass={true}>
                <div className="bg-violet-500/10 border border-violet-500/20 p-2.5 rounded-xl text-violet-400 w-max shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-zinc-200 tracking-wide uppercase">{item.title}</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-sans font-medium">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-6 relative z-10 select-none">
        <div className="absolute inset-0 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />
        
        <Badge variant="primary" className="py-1 px-3 bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 uppercase tracking-widest text-[8px] font-bold">
          Get Started
        </Badge>
        
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-100 max-w-2xl leading-tight">
          Never Let Automated Filters Decide Your Value.
        </h2>
        
        <p className="text-zinc-500 text-xs md:text-sm max-w-md leading-relaxed font-sans font-medium">
          Take control of your application dashboard with custom, local resume tailoring and private job tracking. Set up your onboarding credentials in 10 seconds.
        </p>

        <div className="flex flex-col items-center gap-3 mt-2">
          <Link href={user ? "/dashboard" : "/login?register=true"} className="scale-105">
            <Button 
              variant="primary" 
              size="lg" 
              className="px-10 py-3.5 shadow-xl shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 border-none rounded-xl font-bold"
              rightIcon={<ArrowUpRight className="w-4.5 h-4.5" />}
            >
              {user ? "Enter My Workspace Dashboard" : "Start Free Audit Journey"}
            </Button>
          </Link>
          <span className="text-[10px] font-semibold text-zinc-650">No credit card required. Free tier includes 3 AI matches per day.</span>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 bg-zinc-950 shrink-0 mt-auto select-none z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Career-Ops. All rights reserved. Secure offline credentials sandbox.</p>
          <p className="flex items-center gap-1.5 text-zinc-500 hover:text-violet-400 transition-colors font-semibold">
            <UserCheck className="w-4 h-4 text-violet-400 shrink-0" />
            Powered by Career-Ops AI Engine
          </p>
        </div>
      </footer>

    </main>
  );
}
