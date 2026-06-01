'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Upload,
  Globe,
  Loader2,
  ListPlus,
  Compass,
  CheckCircle2,
  FileCode,
  CheckSquare,
  Cpu
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MarkdownRenderer } from '../components/ui/markdown-renderer';

interface RecommendedRole {
  title: string;
  confidence: number;
  reason: string;
}

interface UserProfile {
  fullName: string;
  email: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Step 1: CV states
  const [cvText, setCvText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  // Step 2: Role states
  const [recommendedRoles, setRecommendedRoles] = useState<RecommendedRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Step 3: Job Discovery states
  const [discoveredJobs, setDiscoveredJobs] = useState<any[]>([]);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [trackedJobs, setTrackedJobs] = useState<string[]>([]); // tracked scrapedJobIds

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
        setProgressText('Saving formatted Master CV...');
        return Math.min(prev + 2, 95);
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      
      clearInterval(interval);
      setParseProgress(100);

      if (!json.success) throw new Error(json.error || 'Failed to parse CV.');

      setCvText(json.text);
      toast.success('CV Parsed successfully! 📄', {
        description: 'You can now verify the parsed markdown CV below.'
      });
    } catch (err: any) {
      clearInterval(interval);
      setParseProgress(0);
      toast.error('Parsing failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
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

      toast.success('Target roles updated! 🎯');
      
      // Trigger Job Discovery search
      discoverJobsForRoles();
      setCurrentStep(3);
    } catch (err: any) {
      toast.error('Failed to save roles', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const discoverJobsForRoles = async () => {
    setSearchingJobs(true);
    setDiscoveredJobs([]);
    try {
      // Fetch jobs for each selected role concurrently
      const searches = selectedRoles.map(async (role) => {
        try {
          const res = await fetch('/api/jobs/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: role, isFreeTier: false })
          });
          const json = await res.json();
          return json.success ? json.matches : [];
        } catch (e) {
          console.error(`Job search failed for ${role}:`, e);
          return [];
        }
      });

      const results = await Promise.all(searches);
      // Flatten matches and eliminate duplicates based on job id
      const allJobs = results.flat();
      const uniqueJobsMap = new Map();
      allJobs.forEach(match => {
        if (match.job && !uniqueJobsMap.has(match.job.id)) {
          uniqueJobsMap.set(match.job.id, match);
        }
      });

      setDiscoveredJobs(Array.from(uniqueJobsMap.values()));
    } catch (err) {
      console.error('Job discovery failed:', err);
      toast.error('Discovery issue', { description: 'Could not fetch job recommendations.' });
    } finally {
      setSearchingJobs(false);
    }
  };

  const handleTrackJob = async (match: any) => {
    const jobId = match.job.id;
    if (trackedJobs.includes(jobId)) return;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: match.job.company,
          roleTitle: match.job.title,
          status: 'Evaluated',
          fitScore: match.fitScore,
          jobUrl: match.job.url,
          notes: `Added during AI Onboarding Job Discovery. Match Compatibility: ${match.fitScore.toFixed(1)}/5.0.`
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setTrackedJobs([...trackedJobs, jobId]);
      toast.success('Job tracked successfully! 📋', {
        description: `"${match.job.title}" at "${match.job.company}" added to your Kanban tracker.`
      });
    } catch (err: any) {
      toast.error('Tracking failed', { description: err.message });
    }
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans">
      
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
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
              Guided Profile Onboarding
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wide">
            Account: {user?.fullName || 'Active Setup'}
          </span>
        </div>
      </header>

      {/* Onboarding Wizard Container */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10 z-10">
        
        {/* Step Indicator Header */}
        <div className="relative w-full max-w-xl mx-auto grid grid-cols-4 items-center py-2 select-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-violet-500 -translate-y-1/2 transition-all duration-500 z-0" 
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, name: 'Upload CV', icon: FileText },
            { step: 2, name: 'Target Roles', icon: ListPlus },
            { step: 3, name: 'Job Discovery', icon: Compass },
            { step: 4, name: 'Complete', icon: CheckSquare }
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
                <span className={`text-[9px] mt-2 font-bold tracking-wide uppercase transition-colors duration-200 ${
                  isActive ? 'text-violet-400' : 'text-zinc-500'
                }`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Main Canvas */}
        <div className="w-full max-w-3xl mx-auto">

          {/* STEP 1: Upload CV */}
          {currentStep === 1 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8" glass={true}>
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" />
                  Step 1: Upload Your CV
                </h2>
                <p className="text-xs text-zinc-550 mt-1">
                  We will parse your resume into standard Markdown format to map matching vacancies dynamically.
                </p>
              </div>

              {/* Upload Tab Selector */}
              <div className="bg-zinc-950 border border-zinc-850 p-1 rounded-xl flex gap-1 text-[11px] font-bold w-max select-none">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'upload' ? 'bg-violet-505 text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'paste' ? 'bg-violet-505 text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
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
                  <div className="bg-zinc-950 p-4 rounded-full border border-zinc-850 text-violet-400 mb-1 shadow-inner">
                    {loading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-350">
                    {loading ? 'Processing Document...' : 'Drag & Drop PDF or DOCX File Here'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 max-w-xs leading-normal">
                    Secure parsing is processed offline in your sandbox. Maximum file size size 5MB.
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
                <div className="border border-zinc-850 bg-zinc-950/50 p-6 rounded-2xl flex flex-col gap-4 animate-fade-in select-none">
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
              {(activeTab === 'paste' || cvText) && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Parsed Markdown Profile</span>
                    {activeTab === 'upload' && (
                      <span className="text-violet-400 lowercase font-medium">Verified & ready for custom adjustments</span>
                    )}
                  </label>
                  <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="# Full Name&#10;Contact info...&#10;&#10;### Experience&#10;Describe your work experience..."
                    className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Action Steppers */}
              <div className="flex justify-end pt-2 border-t border-zinc-900">
                <Button
                  variant="primary"
                  onClick={handleSaveCV}
                  disabled={loading || !cvText.trim()}
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save & Continue
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: AI Role Suggestions */}
          {currentStep === 2 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8" glass={true}>
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-violet-400" />
                  Step 2: Define Your Target Positions
                </h2>
                <p className="text-xs text-zinc-550 mt-1">
                  Select the roles you are actively targeting. AI recommended matches based on your CV analysis are listed below.
                </p>
              </div>

              {/* AI Recommendations list */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AI Recommendations</h4>
                {recommendedRoles.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 border border-zinc-850 bg-zinc-950/20 rounded-xl">
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
                              : 'border-zinc-800/80 bg-zinc-950/20 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-xs text-zinc-200">{role.title}</span>
                            <Badge 
                              variant={role.confidence >= 90 ? 'success' : 'primary'} 
                              className="text-[8px] tracking-wide shrink-0 py-0.5 px-1.5"
                            >
                              {role.confidence}% match
                            </Badge>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-normal leading-relaxed">{role.reason}</p>
                          
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Add Custom Target Role</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Solution Architect, Frontend Engineer"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500/50"
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
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Selected targets ({selectedRoles.length})</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoles.map((role, idx) => (
                      <Badge 
                        key={idx} 
                        variant="primary" 
                        className="py-1 px-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] flex items-center gap-1.5"
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
                  Save & Search Jobs
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Job Discovery */}
          {currentStep === 3 && (
            <Card className="animate-fade-in flex flex-col gap-6 p-6 md:p-8" glass={true}>
              <div className="border-b border-zinc-800 pb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-violet-400 animate-spin-slow" />
                    Step 3: Discover Matching Positions
                  </h2>
                  <p className="text-xs text-zinc-550 mt-1">
                    Based on your selected target roles, we found the following potential vacancies. Track them directly into your Kanban board!
                  </p>
                </div>
                {discoveredJobs.length > 0 && (
                  <Badge variant="success" className="py-1 px-2 bg-emerald-500/10 text-emerald-450 border-emerald-500/20 shrink-0 select-none">
                    {discoveredJobs.length} active jobs
                  </Badge>
                )}
              </div>

              {/* Discovered Jobs List */}
              <div className="flex flex-col gap-4">
                {searchingJobs ? (
                  <div className="border border-zinc-850 bg-zinc-950/20 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 select-none">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    <p className="text-xs font-bold text-zinc-350">Scanning job boards...</p>
                    <p className="text-[10px] text-zinc-500 text-center max-w-xs leading-normal">
                      Querying matching vacancies on active portals. This may take a brief moment.
                    </p>
                  </div>
                ) : discoveredJobs.length === 0 ? (
                  <div className="border border-zinc-850 bg-zinc-950/10 p-8 rounded-2xl text-center flex flex-col gap-2 items-center justify-center select-none">
                    <Globe className="w-6 h-6 text-zinc-650" />
                    <p className="text-xs font-extrabold text-zinc-350">No initial job matches cached.</p>
                    <p className="text-[10px] text-zinc-550 max-w-xs leading-normal">
                      Try adding standard software development or business analysis titles in Step 2 to locate matching index vacancies.
                    </p>
                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => setCurrentStep(2)}>
                      Adjust Target Roles
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {discoveredJobs.map((match, idx) => {
                      const jobId = match.job.id;
                      const isTracked = trackedJobs.includes(jobId);
                      return (
                        <Card key={idx} className="p-4 border-zinc-850 bg-zinc-900/10 flex items-center justify-between gap-4" glass={false}>
                          <div className="flex-1 space-y-1.5 truncate">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-zinc-200 truncate">{match.job.title}</span>
                              <Badge 
                                variant={match.fitScore >= 4.0 ? 'success' : 'primary'} 
                                className="text-[9px] py-0 px-1.5 shrink-0 select-none"
                              >
                                Match score: {match.fitScore.toFixed(1)}/5.0
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-500 select-none">
                              <span className="font-bold text-zinc-400">{match.job.company}</span>
                              <span>•</span>
                              <span>{match.job.location || 'Remote / Hybrid'}</span>
                            </div>
                          </div>

                          <Button
                            variant={isTracked ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={isTracked}
                            onClick={() => handleTrackJob(match)}
                            className="shrink-0 text-[10px] py-1.5"
                            leftIcon={isTracked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : undefined}
                          >
                            {isTracked ? 'Tracked' : 'Track Job'}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}
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
                  onClick={() => setCurrentStep(4)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Complete
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Complete Onboarding */}
          {currentStep === 4 && (
            <Card className="animate-fade-in flex flex-col gap-8 p-8 md:p-10 text-center items-center justify-center relative overflow-hidden" glass={true}>
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5 pointer-events-none" />
              
              <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-full text-violet-400 mb-2 shadow-inner select-none animate-bounce-slow">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 select-none">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-100">
                  Profile Configuration Ready!
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your onboarding details are successfully saved. Career-Ops is fully optimized to co-pilot your job search journey.
                </p>
              </div>

              {/* Accomplished items list */}
              <div className="w-full max-w-xs border border-zinc-800 bg-zinc-950/40 p-4 rounded-2xl flex flex-col gap-3.5 text-left text-xs text-zinc-350 select-none">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 font-black border border-emerald-500/20 p-0.5 rounded bg-emerald-500/5" />
                  <span className="font-semibold">Master CV Uploaded & Parsed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 font-black border border-emerald-500/20 p-0.5 rounded bg-emerald-500/5" />
                  <span className="font-semibold">{selectedRoles.length} Target Roles Selected</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 font-black border border-emerald-500/20 p-0.5 rounded bg-emerald-500/5" />
                  <span className="font-semibold">{trackedJobs.length} Vacancy Targets Tracked</span>
                </div>
              </div>

              {/* Complete Action */}
              <div className="w-full max-w-xs pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full py-3 shadow-xl shadow-violet-500/10 font-bold bg-violet-650 hover:bg-violet-500 border-none scale-105"
                  onClick={handleCompleteOnboarding}
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                >
                  Enter Dashboard
                </Button>
              </div>
            </Card>
          )}

        </div>

      </div>

    </main>
  );
}
