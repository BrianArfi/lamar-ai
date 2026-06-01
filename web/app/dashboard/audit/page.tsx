'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe, 
  Check, 
  Link2,
  Upload,
  RefreshCw,
  FileCode,
  FileCheck,
  FolderPlus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { MarkdownRenderer } from '../../components/ui/markdown-renderer';

export default function AuditPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [jdText, setJdText] = useState('');
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Job Profile Info
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // URL Scraper States
  const [jobUrl, setJobUrl] = useState('');
  const [scrapingUrl, setScrapingUrl] = useState(false);

  // Resume Upload States
  const [activeResumeTab, setActiveResumeTab] = useState<'text' | 'file' | 'drive'>('text');
  const [parsingCv, setParsingCv] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  // Result States
  const [evaluated, setEvaluated] = useState(false);
  const [matchData, setMatchData] = useState<{
    company: string;
    role: string;
    score: number;
    archetype: string;
    legitimacy: string;
    report: string;
  } | null>(null);
  
  const [atsData, setAtsData] = useState<{
    score: number;
    passed: boolean;
    warnings: Array<{ type: string; msg: string; severity: string }>;
  } | null>(null);

  const [addingToKanban, setAddingToKanban] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Read URL query parameters from Chrome Extension on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      const titleParam = params.get('title');
      const companyParam = params.get('company');
      const descParam = params.get('description');
      
      if (descParam) {
        setJdText(descParam);
        if (urlParam) setJobUrl(urlParam);
        if (companyParam) setTargetCompany(companyParam);
        if (titleParam) setTargetRole(titleParam);
        setError(null);
        
        toast.success('Successfully imported from Chrome Extension! 🚀', {
          description: `Job description for "${titleParam || 'Role'}" at "${companyParam || 'Company'}" loaded.`,
          duration: 5000
        });
        
        // Clean URL query parameters so they don't persist on page refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleAddToKanban = async () => {
    if (!matchData) return;
    setAddingToKanban(true);
    setAddedSuccess(false);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: matchData.company || targetCompany || 'Unknown Company',
          roleTitle: matchData.role || targetRole || 'Target Role',
          status: 'Evaluated',
          fitScore: matchData.score || 3.0,
          notes: `Evaluated via ATS Audit Studio. Archetype: ${matchData.archetype}. Legitimacy: ${matchData.legitimacy}.`
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to add to Kanban board.');
      setAddedSuccess(true);
      toast.success('Added to Kanban Board! 📋', {
        description: `"${matchData.role || 'Job'}" at "${matchData.company || 'Company'}" tracked in your pipeline.`,
        duration: 4000
      });
    } catch (err: any) {
      toast.error('Kanban tracking failed', { description: err.message });
    } finally {
      setAddingToKanban(false);
    }
  };

  // Populate sample data for instant test
  const handleLoadSample = () => {
    setTargetCompany('TechCorp');
    setTargetRole('Senior Applied AI Engineer');
    setJdText(`We are looking for a Senior Applied AI Engineer at TechCorp.
Key Requirements:
- 5+ years of software development experience with Node.js/TypeScript.
- Hands-on experience developing LLM agents, vector databases, and Retrieval-Augmented Generation (RAG) architectures.
- Experience with container orchestration (Docker/Kubernetes) is highly desirable.
- Prior experience optimizing prompts and managing model costs.`);
    
    setCvText(`# Demo User
**Target Role:** Senior Applied AI Engineer

### Experience
* **Senior AI Developer at AI Solutions (2024 - Present)**
  - Engineered LLM agents using Gemini Pro & Claude Sonnet to automate support pipelines, saving $120k annually.
  - Implemented vector databases (Pinecone) with semantic search.
* **Software Engineer at SoftDev Co (2022 - 2024)**
  - Developed and maintained Node.js REST APIs with PostgreSQL.
  - Automated testing suite using Playwright.

### Skills
Node.js, TypeScript, LLMs, Vector Databases, PostgreSQL, Docker, Playwright`);

    toast.info('Sample Job & Resume populated successfully!', {
      description: 'You can now proceed to Step 2 or edit the fields.'
    });
  };

  // URL Scraper Handler
  const handleScrapeUrl = async () => {
    if (!jobUrl.trim()) return;
    
    setScrapingUrl(true);
    setError(null);
    try {
      const res = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl })
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        if (json.isSkeleton || res.status === 422 || (json.error && (json.error.includes('anti-bot') || json.error.includes('SPA')))) {
          setShowExtensionModal(true);
          toast.warning('Anti-bot or SPA detected!', {
            description: 'This portal requires the local scraping extension.'
          });
        }
        throw new Error(json.error || 'Failed to extract job description content.');
      }
      
      setJdText(json.description);
      if (json.company) setTargetCompany(json.company);
      if (json.title) setTargetRole(json.title);
      setError(null);
      
      toast.success('Job details extracted! 🎉', {
        description: `Successfully loaded "${json.title || 'Role'}" from "${json.company || 'Company'}"`
      });
    } catch (err: any) {
      setError(`URL Scrape failed: ${err.message}`);
      toast.error('Scraping error', { description: err.message });
    } finally {
      setScrapingUrl(false);
    }
  };

  // File Upload Handler (PDF, DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingCv(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setCvText(json.text);
      setActiveResumeTab('text');
      toast.success('Document parsed successfully! 📄', {
        description: `Extracted text from "${file.name}"`
      });
    } catch (err: any) {
      setError(`File parsing failed: ${err.message}`);
      toast.error('File parsing error', { description: err.message });
    } finally {
      setParsingCv(false);
    }
  };

  // Google Drive Fetch Handler
  const handleFetchDrive = async () => {
    if (!driveUrl.trim()) return;

    setParsingCv(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('driveUrl', driveUrl);

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setCvText(json.text);
      setActiveResumeTab('text');
      toast.success('Google Drive CV fetched! 🌐', {
        description: 'Successfully downloaded and extracted document text.'
      });
    } catch (err: any) {
      setError(`Google Drive fetching failed: ${err.message}`);
      toast.error('Fetch failed', { description: err.message });
    } finally {
      setParsingCv(false);
    }
  };

  const handleRunAudit = async () => {
    if (!jdText.trim() || !cvText.trim()) {
      setError('Please provide both a Job Description (Step 1) and your Resume (Step 2).');
      return;
    }

    setLoading(true);
    setError(null);
    setEvaluated(false);

    try {
      const [evalRes, atsRes] = await Promise.all([
        fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: jdText, title: targetRole || 'Target Role', cvText })
        }),
        fetch('/api/validate-ats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: cvText })
        })
      ]);

      const evalJson = await evalRes.json();
      const atsJson = await atsRes.json();

      if (!evalJson.success) throw new Error(evalJson.error || 'Evaluation failed.');
      if (!atsJson.success) throw new Error(atsJson.error || 'ATS check failed.');

      setMatchData(evalJson);
      setAtsData(atsJson);
      setEvaluated(true);
      setCurrentStep(3);
      toast.success('Audit Completed! 🚀', {
        description: 'Resume evaluation and ATS layout analysis ready.'
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during audit.');
      toast.error('Audit failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetAudit = () => {
    setEvaluated(false);
    setMatchData(null);
    setAtsData(null);
    setAddedSuccess(false);
    setCurrentStep(1);
    toast.info('Audit stepper reset.', { description: 'Ready for a new job audit.' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' };
    if (score >= 3.0) return { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10' };
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
        <Badge variant="primary" className="w-max mx-auto shadow-inner py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 mr-1 animate-pulse" /> Powered by AI Engine
        </Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
          AI-Powered Job Matchmaker & ATS Auditor
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
          Audit your resume layout, keywords, and job role compliance in a secure sandboxed environment. Follow the three steps below to optimize your CV.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="relative max-w-xl w-full mx-auto grid grid-cols-3 items-center py-2 select-none">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-violet-550 -translate-y-1/2 transition-all duration-500 z-0" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />

        {[
          { step: 1, name: 'Job Details', icon: Briefcase },
          { step: 2, name: 'Resume', icon: FileText },
          { step: 3, name: 'Audit Report', icon: ShieldCheck }
        ].map((item) => {
          const Icon = item.icon;
          const isCompleted = currentStep > item.step || evaluated;
          const isActive = currentStep === item.step;
          return (
            <div key={item.step} className="flex flex-col items-center justify-center relative z-10">
              <button
                disabled={item.step === 3 && !evaluated}
                onClick={() => setCurrentStep(item.step as 1 | 2 | 3)}
                className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
                  isActive 
                    ? 'bg-zinc-950 border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.2)] font-bold scale-110'
                    : isCompleted
                      ? 'bg-violet-500 border-violet-500 text-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 font-black" /> : <Icon className="w-4 h-4" />}
              </button>
              <span className={`text-[10px] mt-2 font-bold tracking-wide uppercase transition-colors duration-200 ${
                isActive ? 'text-violet-400' : 'text-zinc-500'
              }`}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stepper Content Cards */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Job Details Panel */}
        {currentStep === 1 && (
          <Card className="animate-fade-in flex flex-col gap-5 p-6 md:p-8" glass={true}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/10">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">Step 1: Define Target Job Position</h3>
                  <p className="text-[10px] text-zinc-500">Provide details about the job vacancy to match against.</p>
                </div>
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleLoadSample}
              >
                Load Sample Profile
              </Button>
            </div>

            {/* Company & Role Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. OpenAI, Stripe"
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            {/* URL Import */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scrape Job Portal Link (Greenhouse, LinkedIn, Lever...)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="url" 
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Paste target job listing URL..." 
                    className="w-full bg-zinc-950 border border-zinc-850/80 rounded-xl py-2.5 pl-9 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleScrapeUrl}
                  disabled={scrapingUrl || !jobUrl.trim()}
                  isLoading={scrapingUrl}
                >
                  Scrape Link
                </Button>
              </div>
            </div>

            {/* Textarea JD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Job Description Text</label>
              <textarea 
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description text or qualifications..." 
                className="w-full h-44 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-350 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Stepper Footer Action */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setCurrentStep(2)}
                disabled={!jdText.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Resume
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Resume Details Panel */}
        {currentStep === 2 && (
          <Card className="animate-fade-in flex flex-col gap-5 p-6 md:p-8" glass={true}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/10">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">Step 2: Provide Your Resume</h3>
                  <p className="text-[10px] text-zinc-500">Insert your CV content via direct copy-paste or upload.</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="bg-zinc-950 border border-zinc-850/80 p-1 rounded-xl flex gap-1 text-[10px] font-bold shrink-0">
                <button 
                  onClick={() => setActiveResumeTab('text')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${activeResumeTab === 'text' ? 'bg-violet-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Direct Text
                </button>
                <button 
                  onClick={() => setActiveResumeTab('file')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${activeResumeTab === 'file' ? 'bg-violet-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Upload File
                </button>
                <button 
                  onClick={() => setActiveResumeTab('drive')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${activeResumeTab === 'drive' ? 'bg-violet-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Google Drive
                </button>
              </div>
            </div>

            {/* Tab: Direct Upload File */}
            {activeResumeTab === 'file' && (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/30 hover:bg-zinc-950/50 transition-all flex flex-col items-center justify-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf,.docx" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
                <div className="bg-zinc-950 p-3.5 rounded-full border border-zinc-850/85 text-violet-400 mb-1 shadow-inner">
                  <Upload className="w-5.5 h-5.5" />
                </div>
                <h5 className="text-xs font-bold text-zinc-350">Upload PDF or DOCX Format</h5>
                <p className="text-[10px] text-zinc-500 max-w-xs leading-normal">
                  Files are securely processed offline inside your workspace sandbox. Max size 5MB.
                </p>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={parsingCv}
                  leftIcon={<FileCode className="w-3.5 h-3.5" />}
                >
                  Choose Document File
                </Button>
              </div>
            )}

            {/* Tab: Google Drive Fetch */}
            {activeResumeTab === 'drive' && (
              <div className="border border-dashed border-zinc-800 rounded-xl p-5 bg-zinc-950/30 flex flex-col gap-4">
                <div className="text-[10px] text-amber-400/80 leading-normal flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Google Drive document sharing settings <strong>MUST be set to &quot;Anyone with the link can view&quot;</strong> so the background server crawler can parse the contents.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                      <Link2 className="w-3.5 h-3.5" />
                    </span>
                    <input 
                      type="url" 
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="Paste shared public Google Drive link here..." 
                      className="w-full bg-zinc-950 border border-zinc-850/80 rounded-xl py-2.5 pl-9 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <Button 
                    variant="primary"
                    onClick={handleFetchDrive}
                    disabled={parsingCv || !driveUrl.trim()}
                    isLoading={parsingCv}
                  >
                    Fetch Doc
                  </Button>
                </div>
              </div>
            )}

            {/* Resume Textbox (Always visible for edit/direct input) */}
            {(activeResumeTab === 'text' || cvText.trim()) && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Resume Plaintext or Markdown</label>
                  {cvText.trim() && (
                    <button 
                      onClick={() => setCvText('')}
                      className="text-[10px] text-rose-450 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Text
                    </button>
                  )}
                </div>
                <textarea 
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="# Full Name
Contact info...

### Professional Experience
Write or paste your resume profile details here..." 
                  className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-350 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 transition-colors resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Stepper Actions */}
            <div className="flex justify-between pt-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Step 1
              </Button>
              <Button
                variant="primary"
                onClick={handleRunAudit}
                disabled={loading || !cvText.trim() || !jdText.trim()}
                isLoading={loading}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Run AI Resume Audit
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Complete Audit Report Panel */}
        {currentStep === 3 && evaluated && matchData && atsData && (
          <div className="animate-fade-in flex flex-col gap-6">
            
            {/* Score Dashboard Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* AI Compatibility Score Card */}
              {(() => {
                const style = getScoreColor(matchData.score);
                return (
                  <Card className={`p-5 flex items-center gap-4 ${style.bg} ${style.border}`} glass={false}>
                    <div className={`text-4xl font-extrabold font-mono tracking-tight shrink-0 select-none ${style.text}`}>
                      {matchData.score.toFixed(1)}
                      <span className="text-xs text-zinc-500 font-normal"> / 5.0</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">AI Compatibility</div>
                      <div className="font-bold text-sm text-zinc-100 truncate">{matchData.archetype}</div>
                    </div>
                  </Card>
                );
              })()}

              {/* ATS Compliance Score Card */}
              <Card 
                className={`p-5 flex items-center gap-4 ${
                  atsData.passed 
                    ? 'border-emerald-500/10 bg-emerald-500/5' 
                    : 'border-rose-500/10 bg-rose-500/5'
                }`} 
                glass={false}
              >
                <div className={`text-4xl font-extrabold font-mono tracking-tight shrink-0 select-none ${
                  atsData.passed ? 'text-emerald-450' : 'text-rose-455'
                }`}>
                  {atsData.score}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">ATS Integrity Score</div>
                  <div className="font-bold text-sm text-zinc-100">
                    {atsData.passed ? 'Safe (Standard)' : 'Fails Compliance Check'}
                  </div>
                </div>
              </Card>
            </div>

            {/* Target vacancy summary */}
            <Card className="p-4 grid grid-cols-3 items-center justify-between text-xs" glass={true}>
              <div>
                <span className="text-zinc-500 font-medium">Company:</span>{' '}
                <span className="font-bold text-zinc-200">{matchData.company}</span>
              </div>
              <div className="text-center border-x border-zinc-800/80 px-2">
                <span className="text-zinc-500 font-medium">Target Role:</span>{' '}
                <span className="font-bold text-zinc-200">{matchData.role}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 font-medium">Legitimacy:</span>{' '}
                <Badge 
                  variant={matchData.legitimacy.includes('High') ? 'success' : 'warning'} 
                  glow={true} 
                  className="ml-1"
                >
                  {matchData.legitimacy}
                </Badge>
              </div>
            </Card>

            {/* Actions Box */}
            <Card className="p-5 flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/30" glass={true}>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-xs text-zinc-200 mb-1">Track this Position in your Board</h4>
                <p className="text-[10px] text-zinc-500 max-w-sm">Save this job card inside your Kanban pipelines for further interview rounds.</p>
              </div>
              <Button
                variant={addedSuccess ? 'secondary' : 'primary'}
                onClick={handleAddToKanban}
                disabled={addingToKanban || addedSuccess}
                isLoading={addingToKanban}
                leftIcon={addedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FolderPlus className="w-4 h-4" />}
                className="w-full sm:w-auto shrink-0 shadow-lg shadow-violet-500/10"
              >
                {addedSuccess ? 'Tracked in Job Board' : 'Save in Kanban'}
              </Button>
            </Card>

            {/* ATS Warnings Detail */}
            <div className="flex flex-col gap-2">
              <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 tracking-wider flex items-center gap-2 pl-1 select-none">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                ATS Layout Compliance Warnings ({atsData.warnings.length})
              </h4>
              
              <div className="flex flex-col gap-2">
                {atsData.warnings.length === 0 ? (
                  <Card className="flex items-center gap-3 p-4 border-emerald-500/10 bg-emerald-500/5" glass={false}>
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-250">No layout traps or compliance issues found. Resume format is ATS-optimized!</span>
                  </Card>
                ) : (
                  atsData.warnings.map((warning, idx) => (
                    <Card key={idx} className="flex items-start gap-3 p-4 border-zinc-800 bg-zinc-900/10" glass={false}>
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-455 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs text-zinc-200 block mb-0.5">{warning.type}</span>
                        <span className="text-[11px] text-zinc-400 leading-relaxed block">{warning.msg}</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Markdown AI Output */}
            <div className="flex flex-col gap-2">
              <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 tracking-wider flex items-center gap-2 pl-1 select-none">
                <FileCheck className="w-4 h-4 text-violet-400" />
                AI Evaluation Alignment Output
              </h4>
              <Card className="p-5 md:p-6 bg-zinc-950/90 max-h-[500px] overflow-y-auto" glass={true}>
                <MarkdownRenderer text={matchData.report} />
              </Card>
            </div>

            {/* Stepper Footer reset */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Resume
              </Button>
              <Button
                variant="secondary"
                onClick={resetAudit}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Start New Audit
              </Button>
            </div>

            {/* SaaS Upsell Link */}
            <Card className="p-5 text-center border-violet-500/20 bg-violet-500/5" glass={false}>
              <p className="text-xs text-violet-200 font-semibold mb-3 leading-relaxed">
                Want to automatically tailor your resume to resolve these matching gaps instantly?
              </p>
              <Link href="/dashboard/cv">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />} className="shadow-lg shadow-violet-500/10">
                  Open CV Tailoring Studio
                </Button>
              </Link>
            </Card>

          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-zinc-900 select-none">
        <Card className="p-5 flex flex-col gap-2 bg-zinc-900/20" glass={true}>
          <div className="bg-violet-500/10 border border-violet-500/20 p-2 rounded-xl text-violet-400 w-max mb-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wide">Client-Side Verification</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Your name, contact details, and address are injected locally inside your browser sandbox. No private identity data is sent to cloud AI servers.
          </p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-zinc-900/20" glass={true}>
          <div className="bg-violet-500/10 border border-violet-500/20 p-2 rounded-xl text-violet-400 w-max mb-1">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wide">Smart Link Extraction</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Connect our local Chrome Extension to parse applicant portals locally in your browser session. Bypasses CAPTCHA and anti-bot walls safely.
          </p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-zinc-900/20" glass={true}>
          <div className="bg-violet-500/10 border border-violet-500/20 p-2 rounded-xl text-violet-400 w-max mb-1">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wide">LLM Context Caching</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Utilizes advanced prompt context caching for resume skeletons and STAR stories, optimizing serverless costs and delivering sub-second audits.
          </p>
        </Card>
      </div>

      {/* Extension Instructions Overlay Modal */}
      <Modal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        title="Install Career-Ops Chrome Extension"
        maxWidth="lg"
      >
        <div className="text-xs text-zinc-400 space-y-4 font-sans leading-relaxed">
          <p>
            Our lightweight, security-first chrome browser extension enables you to extract job vacancy listings directly in your local browser window. This bypasses Cloudflare security gates on portals like LinkedIn, Greenhouse, and Lever!
          </p>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3.5">
            <h4 className="font-bold text-zinc-200 text-xs">Easy Step-by-Step Installation (10 Seconds):</h4>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="bg-violet-650 text-violet-250 px-2 py-0.5 rounded font-black text-[10px] h-max shrink-0 mt-0.5">1</span>
                <span>Open Google Chrome and navigate to <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-violet-300 font-mono">chrome://extensions</code></span>
              </div>
              
              <div className="flex gap-2">
                <span className="bg-violet-650 text-violet-250 px-2 py-0.5 rounded font-black text-[10px] h-max shrink-0 mt-0.5">2</span>
                <span>Toggle the <strong>&quot;Developer mode&quot;</strong> switch in the top right corner of the extension dashboard to <strong>ON</strong>.</span>
              </div>
              
              <div className="flex gap-2">
                <span className="bg-violet-650 text-violet-250 px-2 py-0.5 rounded font-black text-[10px] h-max shrink-0 mt-0.5">3</span>
                <span>Click the <strong>&quot;Load unpacked&quot;</strong> button in the top left corner.</span>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                <span className="bg-violet-650 text-violet-250 px-2 py-0.5 rounded font-black text-[10px] h-max shrink-0 w-max mt-0.5">4</span>
                <span className="flex-1">
                  Select the local extension directory in your project repository:
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-[10px] text-zinc-400 font-mono mt-1.5 select-all overflow-x-auto leading-normal">
                    career-ops/chrome-extension
                  </div>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-violet-500/5 border border-violet-500/10 p-3 rounded-xl text-[10px] text-violet-300 leading-normal flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
            <span>
              <strong>Done!</strong> Once installed, visit any supported LinkedIn job description page, click the extension icon in your Chrome toolbar, and watch the vacancy sync seamlessly into this dashboard!
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={() => setShowExtensionModal(false)}
              className="w-full sm:w-auto"
            >
              Got It, Done!
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
