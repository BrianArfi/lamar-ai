'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  FileText, 
  ListPlus, 
  Puzzle, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Upload,
  Globe,
  Loader2,
  CheckCircle2,
  FileCode,
  Copy,
  Eye,
  EyeOff,
  Cpu,
  AlertTriangle,
  Flame,
  ExternalLink
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface RecommendedRole {
  title: string;
  confidence: number;
  reason: string;
}

interface UserProfile {
  fullName: string;
  email: string;
}

interface CvReviewSection {
  name: string;
  score: number;
  status: string;
  suggestions: Array<{ priority: string; text: string }>;
}

interface CvReviewResult {
  overallScore: number;
  sections: CvReviewSection[];
  quickWins: string[];
  antiPatterns: Array<{ type: string; message: string }>;
}

const INDO_PORTALS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', desc: 'Best for professional networking and corporate roles.', category: 'Global/Corporate' },
  { name: 'Glints ID', url: 'https://glints.com/id/opportunities/jobs', desc: 'Leading tech and startup portal in Southeast Asia.', category: 'Tech/Startup' },
  { name: 'Kalibrr ID', url: 'https://www.kalibrr.com/job-board/co/Indonesia/1', desc: 'Popular portal for junior-to-mid tech roles.', category: 'Tech/Entry-Level' },
  { name: 'JobStreet ID', url: 'https://www.jobstreet.co.id/', desc: 'Broad, traditional corporate jobs and large enterprise vacancies.', category: 'General/Corporate' },
  { name: 'Indeed ID', url: 'https://id.indeed.com/', desc: 'Broad aggregator parsing hundreds of local career boards.', category: 'Aggregator' },
  { name: 'Tech in Asia Jobs', url: 'https://www.techinasia.com/jobs', desc: 'Highly targeted tech & startups jobs network.', category: 'Tech/Startups' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Step 1: CV states
  const [cvText, setCvText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  
  // Step 1: AI CV Review Result state
  const [cvReview, setCvReview] = useState<CvReviewResult | null>(null);

  // Step 2: Role states
  const [recommendedRoles, setRecommendedRoles] = useState<RecommendedRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Step 3: Chrome Extension Sync states
  const [syncToken, setSyncToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Guard against unauthenticated or already completed users
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.onboardingComplete) {
            toast.info('Onboarding already complete! Redirecting...');
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to load user profile in onboarding:', err);
        router.push('/login');
      }
    }
    checkUser();
  }, [router]);

  // Fetch Sync Token when entering Step 3
  useEffect(() => {
    if (currentStep === 3) {
      async function fetchToken() {
        try {
          const res = await fetch('/api/auth/token');
          const json = await res.json();
          if (json.success && json.syncToken) {
            setSyncToken(json.syncToken);
          }
        } catch (err) {
          console.error('Failed to fetch sync token:', err);
        }
      }
      fetchToken();
    }
  }, [currentStep]);

  // Handle drag/drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Simulated multi-step parsing progress with actual fetch
  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      toast.warning('Unsupported format', { description: 'Please upload a PDF or DOCX file.' });
      return;
    }

    setLoading(true);
    setParseProgress(10);
    setProgressText('Reading document file...');

    const interval = setInterval(() => {
      setParseProgress(prev => {
        if (prev < 40) {
          setProgressText('Extracting raw text content...');
          return prev + 5;
        }
        if (prev < 80) {
          setProgressText('AI is parsing and formatting your CV...');
          return prev + 8;
        }
        setProgressText('Running AI CV Review and suggestions...');
        return Math.min(prev + 2, 95);
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Parse CV Text
      const parseRes = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData
      });
      const parseJson = await parseRes.json();
      
      if (!parseJson.success) throw new Error(parseJson.error || 'Failed to parse CV.');
      setCvText(parseJson.text);

      // Execute AI Deep Review
      setProgressText('Analyzing ATS compliance & formatting gaps...');
      const reviewRes = await fetch('/api/cv-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: parseJson.text })
      });
      const reviewJson = await reviewRes.json();

      clearInterval(interval);
      setParseProgress(100);

      if (!reviewJson.success) throw new Error(reviewJson.error || 'Failed to review CV.');
      setCvReview(reviewJson.review);

      toast.success('CV Parsed & Reviewed successfully! 📄', {
        description: 'Check your AI CV score and recommendations below.'
      });
    } catch (err: any) {
      clearInterval(interval);
      setParseProgress(0);
      toast.error('Parsing failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasteCVSubmit = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      toast.info('Analyzing your CV text. Please wait...');
      const reviewRes = await fetch('/api/cv-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText })
      });
      const reviewJson = await reviewRes.json();

      if (!reviewJson.success) throw new Error(reviewJson.error || 'Failed to review CV.');
      setCvReview(reviewJson.review);

      toast.success('CV Reviewed successfully! 📄');
    } catch (err: any) {
      toast.error('Review failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCVAndContinue = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvMarkdown: cvText, skills: [] })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success('Master CV saved successfully! 💾');
      
      // Auto-trigger recommendations for Step 2
      fetchRoleRecommendations();
      setCurrentStep(2);
    } catch (err: any) {
      toast.error('Failed to save CV', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleRecommendations = async () => {
    try {
      const res = await fetch('/api/recommend-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText })
      });
      const json = await res.json();
      if (json.success && json.roles) {
        setRecommendedRoles(json.roles);
        // Pre-select top recommendation
        if (json.roles.length > 0) {
          setSelectedRoles([json.roles[0].title]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch role recommendations:', err);
    }
  };

  const handleToggleRoleSelection = (title: string) => {
    if (selectedRoles.includes(title)) {
      setSelectedRoles(selectedRoles.filter(r => r !== title));
    } else {
      setSelectedRoles([...selectedRoles, title]);
    }
  };

  const handleAddCustomRole = () => {
    if (!customRoleInput.trim()) return;
    const cleanRole = customRoleInput.trim();
    if (!selectedRoles.includes(cleanRole)) {
      setSelectedRoles([...selectedRoles, cleanRole]);
    }
    setCustomRoleInput('');
  };

  const handleSaveRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.warning('Selection required', { description: 'Please select or add at least one target role.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRoles: selectedRoles })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success('Target roles saved! 🎯');
      setCurrentStep(3);
    } catch (err: any) {
      toast.error('Failed to save roles', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncToken);
    setTokenCopied(true);
    toast.success('Sync Token copied to clipboard!');
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingComplete: true })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success('Onboarding complete! Welcome to Career-Ops 🎉', {
        duration: 4000
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Could not complete onboarding', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Helper for scoring coloring
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 60) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans relative">
      
      {/* Background gradients for premium glassmorphic aesthetic */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-500/10">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent block">
              Career-Ops
            </span>
            <span className="text-xs text-violet-400 font-bold uppercase tracking-wider block">
              AI Onboarding & Setup
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-wide">
            Account: {user?.fullName || 'Active Setup'}
          </span>
        </div>
      </header>

      {/* Onboarding Wizard Container */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8 z-10">
        
        {/* Step Indicator Header */}
        <div className="relative w-full max-w-xl mx-auto grid grid-cols-3 items-center py-2 select-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-850 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-violet-500 -translate-y-1/2 transition-all duration-500 z-0" 
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />

          {[
            { step: 1, name: 'Upload & Review', icon: FileText },
            { step: 2, name: 'Target Roles', icon: ListPlus },
            { step: 3, name: 'Extension Sync', icon: Puzzle }
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;

            return (
              <div key={item.step} className="flex flex-col items-center justify-center relative z-10">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-350 ${
                    isActive 
                      ? 'bg-zinc-950 border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.2)] font-bold scale-110'
                      : isCompleted
                        ? 'bg-violet-500 border-violet-500 text-black'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 font-black" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] sm:text-xs mt-2 font-bold tracking-wide uppercase transition-colors duration-200 ${
                  isActive ? 'text-violet-400' : 'text-zinc-550'
                }`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Main Canvas */}
        <div className="w-full max-w-3xl mx-auto">

          {/* STEP 1: Upload CV & AI Review */}
          {currentStep === 1 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8 border-zinc-850 bg-zinc-950/20 backdrop-blur">
              <div className="border-b border-zinc-900 pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" />
                  Step 1: Upload CV & AI Integrity Review
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  We will parse and evaluate your CV against ATS standards using GPT-5 models to deliver instant optimization reviews.
                </p>
              </div>

              {/* Upload Tab Selector */}
              <div className="bg-zinc-950 border border-zinc-900 p-1 rounded-xl flex gap-1 text-xs font-bold w-max select-none">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'upload' ? 'bg-violet-500 text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'paste' ? 'bg-violet-500 text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Direct Paste Text
                </button>
              </div>

              {/* Upload Drag & Drop Area */}
              {activeTab === 'upload' && !cvText && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-2xl p-10 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    isDragging 
                      ? 'border-violet-550 bg-violet-500/5 shadow-[0_0_15px_rgba(167,139,250,0.05)]' 
                      : 'border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-zinc-700'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="bg-zinc-950 p-4 rounded-full border border-zinc-900 text-violet-400 mb-1 shadow-inner">
                    {loading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-300">
                    {loading ? 'Processing Document...' : 'Drag & Drop PDF or DOCX File Here'}
                  </h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs leading-normal">
                    Secure parsing is processed offline in your sandbox. Maximum file size 5MB.
                  </p>
                  
                  {!loading && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      leftIcon={<FileCode className="w-3.5 h-3.5" />}
                    >
                      Browse Documents
                    </Button>
                  )}
                </div>
              )}

              {/* Real-time parsing progress */}
              {loading && activeTab === 'upload' && (
                <div className="border border-zinc-900 bg-zinc-950/50 p-6 rounded-2xl flex flex-col gap-4 animate-fade-in select-none">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-350 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                      {progressText}
                    </span>
                    <span className="font-bold text-violet-400 font-mono">{parseProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${parseProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Text area paste or parsed markdown preview */}
              {((activeTab === 'paste' && !cvReview) || (cvText && !cvReview)) && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Markdown Profile</span>
                  </label>
                  <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="# Full Name&#10;Contact info...&#10;&#10;### Experience&#10;Describe your work experience..."
                    className="w-full h-64 bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed"
                  />
                  {activeTab === 'paste' && (
                    <Button 
                      variant="secondary" 
                      onClick={handlePasteCVSubmit} 
                      disabled={loading || !cvText.trim()}
                    >
                      Analyze CV Integrity
                    </Button>
                  )}
                </div>
              )}

              {/* AI CV Review Analysis Visualization */}
              {cvReview && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-zinc-900 bg-zinc-900/10 p-5 rounded-2xl animate-fade-in">
                  
                  {/* Circle Score Gauge */}
                  <div className="flex flex-col items-center justify-center p-4 border border-zinc-900 bg-zinc-950 rounded-xl md:col-span-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">ATS SCORE</span>
                    <div className="relative h-24 w-24">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-800"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`transition-all duration-1000 ${getScoreColor(cvReview.overallScore)}`}
                          strokeDasharray={`${cvReview.overallScore}, 100`}
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-zinc-100">{cvReview.overallScore}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-zinc-450 mt-3">
                      {cvReview.overallScore >= 80 ? '🔥 Great Fit!' : cvReview.overallScore >= 60 ? '✨ Good Potential' : '⚠️ Critical Fixes Needed'}
                    </span>
                  </div>

                  {/* Score breaks & Quick Wins */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Key Section Gaps
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {cvReview.sections.map((sect, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-xs">
                            <span className="font-bold text-zinc-350">{sect.name}</span>
                            <Badge 
                              variant={sect.status === 'excellent' ? 'success' : sect.status === 'good' ? 'primary' : 'danger'} 
                              className="text-[9px]"
                            >
                              {sect.score}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Wins */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        Quick Wins
                      </h4>
                      <ul className="text-xs text-zinc-400 mt-2 list-disc pl-4 space-y-1">
                        {cvReview.quickWins.map((win, idx) => (
                          <li key={idx} className="leading-relaxed">{win}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Anti Pattern warning */}
                  {cvReview.antiPatterns.length > 0 && (
                    <div className="col-span-1 md:col-span-3 border border-rose-500/10 bg-rose-500/5 p-3.5 rounded-xl flex gap-3 text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-350 block">ATS Anti-pattern detected</span>
                        <span className="text-zinc-400 block mt-0.5 leading-normal">{cvReview.antiPatterns[0].message}</span>
                      </div>
                    </div>
                  )}

                  {/* Suggestions Detail Expand */}
                  <div className="col-span-1 md:col-span-3 border-t border-zinc-900 pt-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-zinc-450 uppercase">Actionable Suggestions:</span>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {cvReview.sections.flatMap(s => s.suggestions.map((sug, sIdx) => (
                        <div key={sIdx} className="flex gap-2.5 p-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs leading-relaxed text-zinc-350">
                          <span className={`font-black shrink-0 ${sug.priority === 'HIGH' ? 'text-rose-400' : sug.priority === 'MEDIUM' ? 'text-amber-400' : 'text-zinc-500'}`}>
                            [{sug.priority}]
                          </span>
                          <p>{sug.text}</p>
                        </div>
                      )))}
                    </div>
                  </div>

                </div>
              )}

              {/* Action Steppers */}
              <div className="flex justify-end pt-2 border-t border-zinc-900">
                <Button
                  variant="primary"
                  onClick={handleSaveCVAndContinue}
                  disabled={loading || !cvText.trim()}
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save CV & Suggest Roles
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: AI Role Suggestions */}
          {currentStep === 2 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8 border-zinc-850 bg-zinc-950/20 backdrop-blur" glass={true}>
              <div className="border-b border-zinc-900 pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-violet-400" />
                  Step 2: Target Positions & Keywords Suggestions
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Select the roles you are actively targeting. AI recommended matches based on your CV analysis are listed below.
                </p>
              </div>

              {/* AI Recommendations list */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">AI Recommendations</h4>
                {recommendedRoles.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                    <span className="text-xs text-zinc-400">AI is mapping skill alignments to recommend roles...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedRoles.map((role, idx) => {
                      const isSelected = selectedRoles.includes(role.title);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleRoleSelection(role.title)}
                          className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-2 relative group select-none ${
                            isSelected 
                              ? 'border-violet-500 bg-violet-550/5 shadow-[0_0_12px_rgba(167,139,250,0.05)]' 
                              : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-sm text-zinc-200">{role.title}</span>
                            <Badge 
                              variant={role.confidence >= 90 ? 'success' : 'primary'} 
                              className="text-[10px] tracking-wide shrink-0 py-0.5 px-1.5"
                            >
                              {role.confidence}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-550 leading-normal leading-relaxed">{role.reason}</p>
                          
                          {isSelected && (
                            <div className="absolute bottom-3 right-4 h-4.5 w-4.5 rounded-full bg-violet-500 text-black flex items-center justify-center">
                              <Check className="w-3 h-3 font-black" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom input roles */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Add Custom Target Role</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Solution Architect, Frontend Engineer"
                    className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleAddCustomRole}
                    disabled={!customRoleInput.trim()}
                  >
                    Add Role
                  </Button>
                </div>
              </div>

              {/* Selected roles list */}
              {selectedRoles.length > 0 && (
                <div className="flex flex-col gap-2 animate-fade-in select-none">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Selected targets ({selectedRoles.length})</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoles.map((role, idx) => (
                      <Badge 
                        key={idx} 
                        variant="primary" 
                        className="py-1 px-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5"
                      >
                        {role}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRoleSelection(role);
                          }}
                          className="hover:text-rose-400 font-bold shrink-0 cursor-pointer"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between pt-4 border-t border-zinc-900">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveRoles}
                  disabled={loading || selectedRoles.length === 0}
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save & Setup Extension
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Chrome Extension & Sync Token */}
          {currentStep === 3 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8 border-zinc-850 bg-zinc-950/20 backdrop-blur" glass={true}>
              <div className="border-b border-zinc-900 pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-violet-400 animate-pulse" />
                  Step 3: Deploy Chrome Extension & Sync Token
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Connect the local browser extension to auto-import job postings and auto-fill applications instantly.
                </p>
              </div>

              {/* Token Copy Widget */}
              <div className="flex flex-col gap-3 p-4 border border-zinc-900 bg-zinc-950 rounded-2xl select-none">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold tracking-wider uppercase text-zinc-500">Your Secure Sync Token</span>
                  <span className="text-violet-400 font-medium">Keep this private</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-zinc-900 border border-zinc-850 px-3.5 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between text-zinc-300 select-all overflow-x-auto truncate">
                    {showToken ? syncToken : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                    <button 
                      onClick={() => setShowToken(!showToken)}
                      className="ml-2 text-zinc-500 hover:text-zinc-300 shrink-0 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={copyToClipboard}
                    className="shrink-0 rounded-xl"
                    leftIcon={<Copy className="w-4 h-4" />}
                  >
                    {tokenCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Installation Guide */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Visual Installation Guide</h4>
                <div className="space-y-3.5 text-xs text-zinc-400">
                  <div className="flex gap-3">
                    <span className="h-5.5 w-5.5 rounded-full bg-zinc-900 border border-zinc-800 text-violet-400 flex items-center justify-center font-black shrink-0">1</span>
                    <p className="leading-relaxed">
                      Download the extension code or load the folder <code className="bg-zinc-900 px-1 py-0.5 rounded font-mono text-zinc-300">chrome-extension/</code> into Chrome via <b>chrome://extensions</b> by enabling "Developer mode" and clicking <b>"Load unpacked"</b>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-5.5 w-5.5 rounded-full bg-zinc-900 border border-zinc-800 text-violet-400 flex items-center justify-center font-black shrink-0">2</span>
                    <p className="leading-relaxed">
                      Pin the <b>Career-Ops AI</b> extension icon to your toolbar, open the popup window, and paste the <b>Sync Token</b> (copied above) into the settings section.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-5.5 w-5.5 rounded-full bg-zinc-900 border border-zinc-800 text-violet-400 flex items-center justify-center font-black shrink-0">3</span>
                    <p className="leading-relaxed">
                      Navigate to any job board listed below, open any listing, click the extension icon, and select <b>"Tailor CV & Track"</b> to import it, or use the <b>"Auto-fill"</b> tab to fill forms automatically!
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Indonesian Portals Grid */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recommended Portals for Indonesia</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {INDO_PORTALS.map((portal, idx) => (
                    <a 
                      key={idx}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-zinc-900 bg-zinc-900/10 p-3.5 rounded-xl hover:border-zinc-700 transition-all flex flex-col justify-between group select-none gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-sm text-zinc-300 group-hover:text-violet-400 transition-colors">{portal.name}</span>
                        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 font-bold">{portal.category}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-normal leading-relaxed">{portal.desc}</p>
                      <div className="flex justify-end text-[10px] font-bold text-violet-400 group-hover:text-violet-300 gap-1 items-center">
                        Open Portal <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between pt-4 border-t border-zinc-900">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  isLoading={loading}
                  rightIcon={<Check className="w-4 h-4" />}
                >
                  Complete Onboarding
                </Button>
              </div>
            </Card>
          )}

        </div>

      </div>

    </main>
  );
}
