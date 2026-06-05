'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  Edit3,
  Upload,
  Info,
  X,
  Loader2,
  Briefcase,
  Wand2,
  Sparkle,
  ExternalLink,
  Copy,
  ChevronRight
} from 'lucide-react';
import { toast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MarkdownRenderer } from '../../components/ui/markdown-renderer';

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  notes: string | null;
  jobUrl: string | null;
  status: string;
  appliedDate?: string | null;
  tailoredCv?: string | null;
  tailoredCvSkills?: string | null;
  tailoredAtsScore?: number | null;
}

interface SuggestedAddition {
  gap: string;
  recommendation: string;
}

export default function CvTailoringStudio() {
  const router = useRouter();
  const [cvMarkdown, setCvMarkdown] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Custom dismissible banner
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Active applications for tailoring
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [customJobDesc, setCustomJobDesc] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tailoringCv, setTailoringCv] = useState(false);
  const [dropdownHighlight, setDropdownHighlight] = useState(false);

  // Suggested Additions (gaps analysis) from AI Tailoring
  const [suggestedAdditions, setSuggestedAdditions] = useState<SuggestedAddition[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setProgressText('Reading resume document...');
    setError(null);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 40) {
          setProgressText('Extracting raw text from document...');
          return prev + 5;
        }
        if (prev < 80) {
          setProgressText('AI is formatting CV into structured Markdown...');
          return prev + 8;
        }
        setProgressText('Saving CV to local SQLite database...');
        return Math.min(prev + 2, 95);
      });
    }, 450);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const parseRes = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData
      });
      const parseJson = await parseRes.json();
      if (!parseJson.success) throw new Error(parseJson.error || 'Failed to extract text from document.');

      const cvText = parseJson.text;
      if (!cvText) throw new Error('Extracted text is empty.');

      const reformatRes = await fetch('/api/resumes/reformat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText })
      });
      const reformatJson = await reformatRes.json();
      if (!reformatJson.success) throw new Error(reformatJson.error || 'Failed to reformat CV with AI.');

      setCvMarkdown(reformatJson.cvMarkdown);
      setSkills(reformatJson.skills || []);

      const saveRes = await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvMarkdown: reformatJson.cvMarkdown, skills: reformatJson.skills || [] })
      });
      const saveJson = await saveRes.json();
      if (!saveJson.success) throw new Error(saveJson.error || 'Failed to save CV.');

      clearInterval(interval);
      setUploadProgress(100);

      toast.success('Document imported successfully! 🎉', {
        description: 'Your resume has been reformatted into Markdown and saved.',
        duration: 4000
      });

    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(0);
      toast.error('Import failed', { description: err.message });
      setError(err.message || 'Import failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ATS Checker States
  const [atsScore, setAtsScore] = useState(100);
  const [atsPassed, setAtsPassed] = useState(true);
  const [atsWarnings, setAtsWarnings] = useState<Array<{ type: string; msg: string; severity: string }>>([]);
  const [checkingAts, setCheckingAts] = useState(false);

  // Mode States (Editor vs Preview)
  const [editMode, setEditMode] = useState(true);

  // Master Resume State
  const [masterCv, setMasterCv] = useState<{ cvMarkdown: string; skills: string[] } | null>(null);

  // Fetch resume & applications from SQLite
  const fetchResume = async () => {
    try {
      setLoading(true);
      const [cvRes, appsRes] = await Promise.all([
        fetch('/api/resumes'),
        fetch('/api/applications')
      ]);
      
      const cvJson = await cvRes.json();
      let initialMarkdown = '';
      let initialSkills: string[] = [];

      if (cvJson.success && cvJson.data) {
        initialMarkdown = cvJson.data.cvMarkdown;
        setCvMarkdown(initialMarkdown);
        try {
          initialSkills = JSON.parse(cvJson.data.skills);
          setSkills(initialSkills);
        } catch {
          initialSkills = [];
          setSkills([]);
        }
        setMasterCv({ cvMarkdown: initialMarkdown, skills: initialSkills });
      }

      const appsJson = await appsRes.json();
      if (appsJson.success && appsJson.data) {
        setApplications(appsJson.data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading dashboard data.');
      toast.error('Load failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Run ATS Validator API
  const runAtsCheck = async (text: string) => {
    if (!text.trim()) return;
    try {
      setCheckingAts(true);
      const res = await fetch('/api/validate-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      });
      const json = await res.json();
      if (json.success) {
        setAtsScore(json.score);
        setAtsPassed(json.passed);
        setAtsWarnings(json.warnings);
      }
    } catch (err) {
      console.error("ATS Validation failed:", err);
    } finally {
      setCheckingAts(false);
    }
  };

  // 1. Chrome Extension url params intake logic
  useEffect(() => {
    async function handleExtensionIntake() {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const extUrl = params.get('url');
      const extTitle = params.get('title');
      const extCompany = params.get('company');
      const extDesc = params.get('description');

      if (extUrl && extTitle && extCompany && extDesc) {
        try {
          setLoading(true);
          toast.info('Importing job listing from Chrome Extension...');
          
          const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: extCompany,
              roleTitle: extTitle,
              status: 'Evaluated',
              fitScore: 4.0, // Default baseline compatibility
              jobUrl: extUrl,
              notes: extDesc
            })
          });
          const json = await res.json();
          
          if (json.success && json.data) {
            toast.success(`Tracked "${extTitle}" at "${extCompany}" successfully! 🎉`);
            // Redirect to CV Tailoring directly selecting this new application and clean query params
            router.replace(`/dashboard/cv?appId=${json.data.id}`);
            // Force fetch layout applications again
            fetchResume();
          } else {
            throw new Error(json.error || 'Failed to auto-create job application.');
          }
        } catch (e: any) {
          toast.error('Extension import failed', { description: e.message });
        } finally {
          setLoading(false);
        }
      }
    }
    handleExtensionIntake();
  }, []);

  useEffect(() => {
    fetchResume();
  }, []);

  // Sync with appId search param on load
  useEffect(() => {
    if (typeof window !== 'undefined' && applications.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const appId = params.get('appId');
      if (appId) {
        setSelectedAppId(appId);
      }
    }
  }, [applications]);

  // Synchronize editor content when selectedAppId changes
  useEffect(() => {
    setSuggestedAdditions([]); // Clear gaps on app change
    if (!selectedAppId || selectedAppId === 'custom') {
      if (masterCv) {
        setCvMarkdown(masterCv.cvMarkdown);
        setSkills(masterCv.skills);
      }
      return;
    }

    const selectedApp = applications.find(app => app.id === selectedAppId);
    if (selectedApp) {
      if (selectedApp.tailoredCv) {
        setCvMarkdown(selectedApp.tailoredCv);
        try {
          setSkills(JSON.parse(selectedApp.tailoredCvSkills || '[]'));
        } catch {
          setSkills([]);
        }
        if (selectedApp.tailoredAtsScore) {
          setAtsScore(selectedApp.tailoredAtsScore);
        }
      } else {
        if (masterCv) {
          setCvMarkdown(masterCv.cvMarkdown);
          setSkills(masterCv.skills);
        }
      }
    }
  }, [selectedAppId, applications, masterCv]);

  // Debounced ATS live check
  useEffect(() => {
    if (loading || !cvMarkdown.trim()) return;
    
    const timer = setTimeout(() => {
      runAtsCheck(cvMarkdown);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [cvMarkdown, loading]);

  // Save master CV changes
  const handleSaveCv = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvMarkdown, skills })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      if (cvMarkdown && skills) {
        setMasterCv({ cvMarkdown, skills });
      }

      toast.success('Master CV saved successfully! 💾', {
        description: 'Stored in SQLite, and dynamic ATS validations synced.',
        duration: 3500
      });
    } catch (err: any) {
      toast.error('Save failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Save tailored CV specifically for active application
  const handleSaveTailoredCv = async () => {
    if (!selectedAppId || selectedAppId === 'custom') return;
    try {
      setSaving(true);
      const res = await fetch(`/api/applications/${selectedAppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tailoredCv: cvMarkdown,
          tailoredCvSkills: JSON.stringify(skills),
          tailoredAtsScore: atsScore
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setApplications(prev => prev.map(app => 
        app.id === selectedAppId 
          ? { 
              ...app, 
              tailoredCv: cvMarkdown, 
              tailoredCvSkills: JSON.stringify(skills), 
              tailoredAtsScore: atsScore 
            } 
          : app
      ));

      toast.success('Tailored CV saved successfully! 💾', {
        description: 'Stored for this job application specifically, leaving Master CV intact.',
        duration: 3500
      });
    } catch (err: any) {
      toast.error('Save failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Reset tailored CV back to Master CV
  const handleResetToMaster = async () => {
    if (!selectedAppId || selectedAppId === 'custom') return;
    if (!confirm("Are you sure you want to discard tailored changes and reset this job application to use your Master CV?")) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/applications/${selectedAppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tailoredCv: null,
          tailoredCvSkills: null,
          tailoredAtsScore: null
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setApplications(prev => prev.map(app => 
        app.id === selectedAppId 
          ? { 
              ...app, 
              tailoredCv: null, 
              tailoredCvSkills: null, 
              tailoredAtsScore: null 
            } 
          : app
      ));

      if (masterCv) {
        setCvMarkdown(masterCv.cvMarkdown);
        setSkills(masterCv.skills);
      }

      toast.success('Reset to Master CV successful! 🔄');
    } catch (err: any) {
      toast.error('Reset failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Dynamic AI Tailoring trigger
  const handleAutoTailor = async () => {
    if (!cvMarkdown.trim()) {
      toast.warning('CV Empty ⚠️', { description: 'Please import or write your CV first.' });
      return;
    }

    if (!selectedAppId) {
      setDropdownHighlight(true);
      toast.warning('Selection Required ⚠️', { 
        description: 'Please select a tracked job application or choose "Direct Paste Job Description".',
        duration: 5000
      });
      setTimeout(() => setDropdownHighlight(false), 2000);
      return;
    }

    let roleTitle = 'Software Engineer';
    let companyName = 'Target Company';
    let jobDescriptionText = '';

    if (selectedAppId === 'custom') {
      if (!customJobDesc.trim()) {
        toast.warning('Description required', { description: 'Please paste the target job description first.' });
        return;
      }
      roleTitle = 'Target Role';
      jobDescriptionText = customJobDesc;
    } else {
      const selectedApp = applications.find(app => app.id === selectedAppId);
      if (!selectedApp) {
        toast.warning('Selection required', { description: 'Please select a tracked job application or enter custom details.' });
        return;
      }
      roleTitle = selectedApp.roleTitle;
      companyName = selectedApp.companyName;
      jobDescriptionText = selectedApp.notes || '';
    }

    setTailoringCv(true);
    setUploadProgress(15);
    setProgressText('Extracting context keywords...');

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 40) {
          setProgressText('Parsing alignment indices...');
          return prev + 5;
        }
        if (prev < 80) {
          setProgressText('AI is adjusting bullet point parameters...');
          return prev + 8;
        }
        setProgressText('Verifying standard ATS compliance...');
        return Math.min(prev + 2, 95);
      });
    }, 450);

    try {
      const res = await fetch('/api/resumes/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvMarkdown,
          roleTitle,
          companyName,
          jobDescription: jobDescriptionText
        })
      });
      const json = await res.json();
      
      clearInterval(interval);
      setUploadProgress(100);

      if (!json.success) throw new Error(json.error || 'Tailoring failed.');

      // Update local states
      setCvMarkdown(json.cvMarkdown);
      setSuggestedAdditions(json.suggestedAdditions || []);
      
      // Run immediate ATS check for instant score update
      let score = 95;
      try {
        const atsRes = await fetch('/api/validate-ats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: json.cvMarkdown })
        });
        const atsJson = await atsRes.json();
        if (atsJson.success) {
          score = atsJson.score;
          setAtsScore(atsJson.score);
          setAtsPassed(atsJson.passed);
          setAtsWarnings(atsJson.warnings);
        }
      } catch (atsErr) {
        console.error("ATS validate error in tailoring:", atsErr);
      }

      if (selectedAppId && selectedAppId !== 'custom') {
        // Auto-save specifically to this job application
        await fetch(`/api/applications/${selectedAppId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tailoredCv: json.cvMarkdown,
            tailoredCvSkills: JSON.stringify(skills),
            tailoredAtsScore: score
          })
        });
        
        // Update local applications state
        setApplications(prev => prev.map(app => 
          app.id === selectedAppId 
            ? { 
                ...app, 
                tailoredCv: json.cvMarkdown, 
                tailoredCvSkills: JSON.stringify(skills),
                tailoredAtsScore: score
              } 
            : app
        ));
      }

      toast.success('CV Tailored Successfully! ✨', {
        description: selectedAppId === 'custom' 
          ? 'Successfully optimized CV for custom details.' 
          : `Successfully optimized and saved specifically for "${roleTitle}" at "${companyName}".`,
        duration: 4500
      });
    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(0);
      toast.error('Tailoring failed', { description: err.message });
    } finally {
      setTailoringCv(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      
      {/* 1. Page Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            CV Tailoring Studio
          </h2>
          <p className="text-xs text-zinc-550 mt-0.5">Edit and optimize your master CV inside a dynamic, offline sandbox parser.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none">
          {/* Editor/Preview Toggle */}
          <div className="bg-zinc-900 border border-zinc-805 p-1 rounded-xl flex gap-1 text-[11px] font-bold">
            <button 
              onClick={() => setEditMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${editMode ? 'bg-violet-500 text-black font-bold shadow-md shadow-violet-500/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button 
              onClick={() => setEditMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${!editMode ? 'bg-violet-500 text-black font-bold shadow-md shadow-violet-500/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.docx,.txt" 
            className="hidden" 
          />

          <Button 
            variant="secondary"
            size="sm"
            onClick={handleUploadClick}
            disabled={uploading || loading}
            isLoading={uploading}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import CV
          </Button>

          {selectedAppId && selectedAppId !== 'custom' ? (
            <>
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleResetToMaster}
                disabled={saving || loading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reset to Master
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={handleSaveTailoredCv}
                disabled={saving || loading}
                isLoading={saving}
                leftIcon={<Save className="w-3.5 h-3.5 text-black font-black" />}
                className="bg-violet-500 hover:bg-violet-400 text-black shadow-lg shadow-violet-500/10"
              >
                Save Tailored CV
              </Button>
            </>
          ) : (
            <Button 
              variant="primary"
              size="sm"
              onClick={handleSaveCv}
              disabled={saving || loading}
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Master CV
            </Button>
          )}
        </div>
      </div>

      {/* 2. Dismissible Guidance Banner */}
      {showInfoBanner && (
        <Card className="flex items-start gap-4 p-4 border-violet-500/10 bg-violet-500/5 animate-fade-in relative" glass={false}>
          <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/15 shrink-0 select-none">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-8">
            <h4 className="font-extrabold text-xs text-zinc-150 mb-0.5">Tailoring Studio Guidance</h4>
            <div className="font-normal font-sans text-zinc-400 leading-normal text-xs">
              <MarkdownRenderer text="This space stores your **Master CV** in markdown format. You can manually adjust details in the **Editor** or select an application below to **Auto-Tailor CV with AI** using GPT-5 models to perfectly match target keywords and STAR experiences. Experience gaps will be analyzed and surfaced." />
            </div>
          </div>
          <button 
            onClick={() => setShowInfoBanner(false)}
            className="absolute top-4 right-4 p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg cursor-pointer"
            aria-label="Close banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Card>
      )}

      {/* 3. AI CV TAILORING CONTROLLER UNIT */}
      {!loading && !error && (
        <Card className="p-5 border-zinc-850 bg-zinc-900/10 flex flex-col gap-4 animate-fade-in" glass={true}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/15">
                <Sparkle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-2">
                  <span>AI Resume Tailoring Engine (GPT-5 Mode)</span>
                  {selectedAppId && selectedAppId !== 'custom' && (
                    applications.find(app => app.id === selectedAppId)?.tailoredCv ? (
                      <Badge variant="success" glow={true} className="text-[9px] py-0 px-2">Tailored CV Active</Badge>
                    ) : (
                      <Badge variant="default" className="text-[9px] py-0 px-2 border-zinc-800 bg-zinc-900 text-zinc-400">Using Master CV</Badge>
                    )
                  )}
                </h4>
                <p className="text-[10px] text-zinc-500">Auto-tailor bullet points to emphasize relevant skills for a specific target job vacancy.</p>
              </div>
            </div>

            {/* Dropdown selectors */}
            <div className="flex flex-wrap items-center gap-3 select-none">
              <select
                value={selectedAppId}
                onChange={(e) => {
                  setSelectedAppId(e.target.value);
                  setShowCustomInput(e.target.value === 'custom');
                }}
                className={`bg-zinc-950 text-xs text-zinc-350 rounded-xl px-3 py-2 focus:outline-none transition-all duration-300 cursor-pointer ${
                  dropdownHighlight 
                    ? 'border-2 border-rose-500/80 ring-4 ring-rose-500/20 scale-105 shadow-lg shadow-rose-500/5' 
                    : 'border border-zinc-800 focus:border-violet-500/50'
                }`}
              >
                <option value="">-- Choose Tracked Job Application --</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.roleTitle} at {app.companyName}
                  </option>
                ))}
                <option value="custom">✍️ Direct Paste Job Description</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAutoTailor}
                disabled={tailoringCv || uploading}
                isLoading={tailoringCv}
                leftIcon={<Wand2 className="w-3.5 h-3.5 text-black font-black" />}
                className="bg-violet-500 hover:bg-violet-400 text-black shadow-lg shadow-violet-500/10"
              >
                Auto-Tailor CV
              </Button>
            </div>
          </div>

          {/* Custom job description paste area */}
          {showCustomInput && (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900 animate-fade-in">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Job Description Context</label>
              <textarea
                value={customJobDesc}
                onChange={(e) => setCustomJobDesc(e.target.value)}
                placeholder="Paste vacancy qualifications, requirements, or bullet points here..."
                className="w-full h-24 bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-zinc-350 focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed"
              />
            </div>
          )}
        </Card>
      )}

      {/* 4. Main Editor Layout Workspace */}
      {loading ? (
        <div className="flex-grow flex items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin text-violet-400 h-8 w-8" />
        </div>
      ) : error ? (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-455 p-6 max-w-xl mx-auto flex items-center gap-3" glass={false}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Failed to load CV tailoring: {error}</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1 min-h-[500px]">
          
          {/* Left Panel: Markdown Content Workspace */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {uploading || tailoringCv ? (
              <div className="w-full flex-grow border border-dashed border-zinc-850 bg-zinc-950/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-6 shadow-xl min-h-[480px] h-full select-none animate-fade-in">
                <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800 text-violet-400 animate-pulse shadow-inner">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                
                <div className="text-center space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-zinc-200">{progressText}</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    AI is structuring experience parameters and layout attributes safely in real-time.
                  </p>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-violet-400 font-mono">
                    <span>PROGRESS STATUS</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-355"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : editMode ? (
              <textarea 
                value={cvMarkdown}
                onChange={(e) => setCvMarkdown(e.target.value)}
                placeholder="# Your Full Name\nTarget position, contact information...\n\n### Professional Experience\n* **Role** at **Company** (Date - Present)\n  - Core accomplishments...\n" 
                className="w-full flex-grow bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 text-xs font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 transition-all resize-none leading-relaxed shadow-xl min-h-[480px] h-full"
              />
            ) : (
              <Card className="w-full flex-grow p-6 overflow-y-auto min-h-[480px] h-full bg-zinc-900/20" glass={true}>
                <MarkdownRenderer text={cvMarkdown} />
              </Card>
            )}
          </div>

          {/* Right Panel: Live ATS & Gaps suggestions checklist */}
          <div className="flex flex-col gap-6 h-full select-none">
            
            {/* Apply Action Panel */}
            {selectedAppId && selectedAppId !== 'custom' && cvMarkdown && (
              <Card className="p-5 border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent flex flex-col gap-4 animate-fade-in" glass={true}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/15">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-200">Application Integration</h4>
                    <p className="text-[10px] text-zinc-500">Resume optimized. Launch your apply flow.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cvMarkdown);
                      toast.success("Markdown copied to clipboard! 📋");
                    }}
                    className="p-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700 rounded-xl text-[9px] font-bold text-zinc-350 hover:text-zinc-200 transition-all cursor-pointer text-center"
                  >
                    Copy Markdown
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([cvMarkdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      const selectedApp = applications.find(app => app.id === selectedAppId);
                      const filename = selectedApp 
                        ? `CV_${selectedApp.companyName.replace(/\s+/g, '_')}_${selectedApp.roleTitle.replace(/\s+/g, '_')}.md`
                        : 'Tailored_CV.md';
                      a.href = url;
                      a.download = filename;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Downloaded Markdown CV! 💾");
                    }}
                    className="p-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700 rounded-xl text-[9px] font-bold text-zinc-350 hover:text-zinc-200 transition-all cursor-pointer text-center"
                  >
                    Download CV
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="p-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700 rounded-xl text-[9px] font-bold text-zinc-350 hover:text-zinc-200 transition-all cursor-pointer text-center"
                  >
                    Print / PDF
                  </button>
                </div>

                {(() => {
                  const selectedApp = applications.find(app => app.id === selectedAppId);
                  if (!selectedApp) return null;
                  
                  return (
                    <div className="space-y-3 pt-2">
                      {selectedApp.jobUrl ? (
                        <a
                          href={selectedApp.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-violet-500 hover:bg-violet-400 text-black font-extrabold text-[11px] py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-500/10 select-none text-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Apply on Original Website
                        </a>
                      ) : (
                        <div className="text-center p-3 bg-zinc-950/30 border border-zinc-850 rounded-xl">
                          <span className="text-[10px] text-zinc-550 italic">No job post URL configured.</span>
                        </div>
                      )}

                      {selectedApp.status.toLowerCase() !== 'applied' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full font-bold py-2 rounded-xl border border-zinc-850"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/applications/${selectedAppId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  status: 'Applied',
                                  appliedDate: new Date().toISOString()
                                })
                              });
                              const json = await res.json();
                              if (!json.success) throw new Error(json.error);

                              setApplications(prev => prev.map(app => 
                                app.id === selectedAppId ? { ...app, status: 'Applied', appliedDate: new Date().toISOString() } : app
                              ));

                              toast.success("Marked as Applied! 🚀");
                            } catch (e: any) {
                              toast.error("Failed to mark as applied", { description: e.message });
                            }
                          }}
                        >
                          Mark as Applied
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                          <span className="font-bold text-[10.5px]">Already Marked as Applied!</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            )}

            {/* AI Experience Gaps Suggestions side panel (New Fitur) */}
            {suggestedAdditions.length > 0 && (
              <Card className="p-4 border-amber-500/20 bg-amber-500/5 flex flex-col gap-3.5 animate-fade-in select-none" glass={false}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/15">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-extrabold text-[10px] uppercase text-zinc-200 tracking-wider">
                    Experience Gaps AI Suggestions
                  </h4>
                </div>
                <div className="max-h-52 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-850">
                  {suggestedAdditions.map((addition, aIdx) => (
                    <div key={aIdx} className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10.5px]">
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        <span>Gap: {addition.gap}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded-lg text-[10.5px] text-zinc-400 relative group leading-normal leading-relaxed">
                        <p>{addition.recommendation}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(addition.recommendation);
                            toast.success('Recommendation copied to clipboard!');
                          }}
                          className="absolute bottom-2 right-2 p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                          title="Copy Draft"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ATS Score display */}
            <Card className={`p-5 flex flex-col gap-4 border ${atsPassed ? 'border-emerald-500/10 bg-emerald-500/5' : 'border-rose-500/10 bg-rose-500/5'}`} glass={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${
                    atsPassed 
                      ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/15 text-rose-450'
                  }`}>
                    <Sparkles className="w-4 h-4 animate-float" />
                  </div>
                  <h3 className="font-extrabold text-[10px] uppercase text-zinc-300 tracking-wider">Live ATS Compliance</h3>
                </div>
                {checkingAts && (
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-550 animate-spin shrink-0" />
                )}
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className={`text-5xl font-extrabold font-mono tracking-tight ${atsPassed ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {atsScore}
                </span>
                <span className="text-xs text-zinc-550 font-bold">/100</span>
              </div>

              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-normal">
                Calculated by validating structural keyword triggers, anchor headers, contact sections, and semantic density. Safe limits require a score above 70.
              </p>

              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-850/80 mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${atsPassed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-zinc-550 uppercase tracking-wider">
                <span>Critical Risk</span>
                <span>Highly Parsable</span>
              </div>
            </Card>

            {/* Warnings list card */}
            <Card className="flex-1 flex flex-col gap-4 p-5" glass={true}>
              <h4 className="font-extrabold text-[10px] uppercase text-zinc-455 tracking-wider pb-3 border-b border-zinc-800/80">
                Optimization checklist ({atsWarnings.length})
              </h4>
              
              <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 space-y-3 scrollbar-thin scrollbar-thumb-zinc-850">
                {atsWarnings.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center gap-2.5 h-full">
                    <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/10">
                      <CheckCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs text-zinc-200 font-bold">Excellent Parser Integrity!</span>
                    <span className="text-[10px] text-zinc-500 max-w-[180px] leading-normal mx-auto">No parser traps or layout locks detected. CV layout is fully optimized.</span>
                  </div>
                ) : (
                  atsWarnings.map((warning, i) => (
                    <div key={i} className="text-xs p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-2.5 hover:border-zinc-700 transition-colors">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${warning.severity === 'HIGH' ? 'text-rose-455' : 'text-amber-450'}`} />
                      <div>
                        <span className="font-bold text-[11px] text-zinc-200 block mb-0.5">{warning.type}</span>
                        <span className="text-zinc-450 text-[10.5px] leading-relaxed block">{warning.msg}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
}
