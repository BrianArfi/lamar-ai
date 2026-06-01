'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Briefcase, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Globe, 
  Lock, 
  Cpu, 
  FolderPlus,
  RefreshCw,
  TrendingUp,
  Award,
  Video,
  FileCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { EmptyState } from '../components/ui/empty-state';

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  status: string;
  fitScore: number;
  notes: string | null;
  jobUrl: string | null;
  appliedDate?: string | null;
  tailoredCv?: string | null;
  tailoredCvSkills?: string | null;
  tailoredAtsScore?: number | null;
  createdAt: string;
}

interface ScrapedJobMatch {
  id: string;
  fitScore: number;
  job: {
    id: string;
    platform: string;
    title: string;
    company: string;
    location: string | null;
    description: string;
    url: string;
  };
}

const COLUMNS = [
  { name: 'Evaluated', label: 'Evaluated', color: 'border-zinc-800 bg-zinc-900/10 text-zinc-400' },
  { name: 'Applied', label: 'Applied', color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400' },
  { name: 'Responded', label: 'Responded', color: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400' },
  { name: 'Interview', label: 'Interviewing', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400' },
  { name: 'Offer', label: 'Offer Received', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
  { name: 'Discarded', label: 'Skip / Closed', color: 'border-rose-500/20 bg-rose-500/5 text-rose-400' }
];

export default function TrackerDashboard() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'discovery'>('pipeline');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drag & Drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);

  // Discovery / Job Search States
  const [searchQuery, setSearchQuery] = useState('Software Engineer');
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [searchResults, setSearchResults] = useState<ScrapedJobMatch[]>([]);
  const [paywallData, setPaywallData] = useState<{
    locked: boolean;
    totalMatchesFound: number;
    unlockedCount: number;
    message: string;
  } | null>(null);

  // Add Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [fitScore, setFitScore] = useState('4.0');
  const [status, setStatus] = useState('Evaluated');
  const [notes, setNotes] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  // Delete Confirmation Modal State
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [deletingApp, setDeletingApp] = useState(false);

  // Job Details Modal States
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleUpdateApplicationDetails = async (updatedFields: Partial<Application>) => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      const updatedApp = json.data;
      setApplications(prev => prev.map(app => 
        app.id === selectedApp.id ? { ...app, ...updatedApp } : app
      ));
      setSelectedApp(prev => prev ? { ...prev, ...updatedApp } : null);
      toast.success('Application updated successfully! 🎉');
    } catch (err: any) {
      toast.error('Failed to update details', { description: err.message });
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setApplications(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications.');
      toast.error('Failed to load applications', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Fetch user target roles to pre-populate search query
    async function fetchUserProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user && json.user.targetRoles) {
            const roles = JSON.parse(json.user.targetRoles);
            if (Array.isArray(roles) && roles.length > 0) {
              setSearchQuery(roles[0]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load user profile in dashboard page:', e);
      }
    }
    fetchUserProfile();
  }, []);

  // Update application status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      toast.success('Status updated successfully.');
    } catch (err: any) {
      toast.error('Failed to update status', { description: err.message });
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.currentTarget.classList.add('drag-dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedAppId(null);
    e.currentTarget.classList.remove('drag-dragging');
  };

  const handleDragOverCol = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    setActiveDragCol(colName);
  };

  const handleDragLeaveCol = (e: React.DragEvent) => {
    setActiveDragCol(null);
  };

  const handleDropCol = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setActiveDragCol(null);
    
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const app = applications.find(a => a.id === appId);
    if (app && app.status.toLowerCase() !== targetStatus.toLowerCase()) {
      // Optimistically update local state
      setApplications(prev => prev.map(a => 
        a.id === appId ? { ...a, status: targetStatus } : a
      ));
      
      try {
        const res = await fetch(`/api/applications/${appId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        
        toast.success('Status updated!', {
          description: `Moved "${app.companyName}" to ${targetStatus}.`,
          duration: 3000
        });
      } catch (err: any) {
        // Revert on error
        fetchApplications();
        toast.error('Movement failed', { description: err.message });
      }
    }
  };

  // Delete application
  const handleDeleteApplication = async () => {
    if (!deleteAppId) return;
    setDeletingApp(true);
    try {
      const res = await fetch(`/api/applications/${deleteAppId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setApplications(prev => prev.filter(app => app.id !== deleteAppId));
      toast.success('Job application deleted successfully.');
      setDeleteAppId(null);
    } catch (err: any) {
      toast.error('Deletion failed', { description: err.message });
    } finally {
      setDeletingApp(false);
    }
  };

  // Create manual application
  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          roleTitle,
          status,
          fitScore: parseFloat(fitScore) || 3.0,
          jobUrl: jobUrl || null,
          notes: notes || null
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setCompanyName('');
      setRoleTitle('');
      setNotes('');
      setJobUrl('');
      setFitScore('4.0');
      setStatus('Evaluated');
      setShowAddModal(false);
      
      toast.success('Application added manually!');
      fetchApplications();
    } catch (err: any) {
      toast.error('Failed to create application', { description: err.message });
    }
  };

  // Trigger search on Indonesian prominent portals
  const handleSearchJobs = async () => {
    if (!searchQuery.trim()) return;

    setSearchingJobs(true);
    setError(null);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, isFreeTier: true })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSearchResults(json.matches);
      setPaywallData(json.paywall);
      toast.success(`Aggregated search finished. Found ${json.matches.length} jobs!`);
    } catch (err: any) {
      setError(err.message || 'Job search failed.');
      toast.error('Search failed', { description: err.message });
    } finally {
      setSearchingJobs(false);
    }
  };

  // Track a scraped job match in their Kanban board
  const handleTrackScrapedJob = async (match: ScrapedJobMatch) => {
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
          notes: `Discovered on ${match.job.platform} using SaaS Matchmaker. Description: ${match.job.description.slice(0, 150)}...`
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success('Added to Kanban Pipeline! 🎉', {
        description: `"${match.job.title}" at "${match.job.company}" is now tracked.`
      });
      fetchApplications();
    } catch (err: any) {
      toast.error('Failed to track job', { description: err.message });
    }
  };

  const getBadgeVariant = (score: number) => {
    if (score >= 4.0) return 'success';
    if (score >= 3.0) return 'warning';
    return 'danger';
  };

  // Compute Quick Stats
  const totalApps = applications.length;
  const appliedCount = applications.filter(a => a.status.toLowerCase() === 'applied').length;
  const interviewCount = applications.filter(a => a.status.toLowerCase() === 'interview').length;
  const offersCount = applications.filter(a => a.status.toLowerCase() === 'offer').length;

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      
      {/* 1. Header controls tab switcher and manually add buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Applications Board
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Manage and track your active job vacancies in a responsive pipeline dashboard.</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex gap-1 text-[11px] font-bold">
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'pipeline' ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'discovery' ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              Aggregated Search
            </button>
          </div>

          {activeTab === 'pipeline' && (
            <Button 
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Job
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Statistic Cards Row (Only for Pipeline tab) */}
      {activeTab === 'pipeline' && totalApps > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {[
            { label: 'Total Positions', val: totalApps, icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10' },
            { label: 'Applications Sent', val: appliedCount, icon: FileCheck, color: 'text-sky-400 bg-sky-500/5 border-sky-500/10' },
            { label: 'Interviews Scheduled', val: interviewCount, icon: Video, color: 'text-purple-400 bg-purple-500/5 border-purple-500/10' },
            { label: 'Job Offers', val: offersCount, icon: Award, color: 'text-emerald-450 bg-emerald-500/5 border-emerald-500/10' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className={`p-4 flex items-center justify-between border ${stat.color}`} glass={false}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">{stat.label}</span>
                  <span className="text-xl font-bold font-mono text-zinc-150 block mt-1">{stat.val}</span>
                </div>
                <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* RENDER TAB 1: PIPELINE / KANBAN BOARD */}
      {activeTab === 'pipeline' && (
        <>
          {loading && applications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : error ? (
            <Card className="border-rose-500/20 bg-rose-500/5 text-rose-455 p-6 max-w-xl mx-auto flex items-center gap-3" glass={false}>
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Failed to sync with local database: {error}</span>
            </Card>
          ) : applications.length === 0 ? (
            <EmptyState
              title="Pipeline is Empty"
              description="You have no tracked vacancies currently. Use the landing page auditor or click 'Add Job' to construct your application board."
              action={
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Manual Card
                </Button>
              }
            />
          ) : (
            /* Columns Horizontal Scroll container for mobile, standard flex/grid for desktop */
            <div className="flex flex-row overflow-x-auto gap-5 pb-4 md:grid md:grid-cols-2 xl:grid-cols-6 items-start scrollbar-thin scrollbar-thumb-zinc-850">
              {COLUMNS.map(col => {
                const colApps = applications.filter(app => app.status.toLowerCase() === col.name.toLowerCase());
                const isDragOver = activeDragCol === col.name;
                
                return (
                  <div 
                    key={col.name} 
                    onDragOver={(e) => handleDragOverCol(e, col.name)}
                    onDragLeave={handleDragLeaveCol}
                    onDrop={(e) => handleDropCol(e, col.name)}
                    className={`flex flex-col gap-4 min-h-[500px] w-64 md:w-auto shrink-0 transition-all rounded-2xl p-2 border-2 border-transparent ${
                      isDragOver ? 'drag-over-column' : ''
                    }`}
                  >
                    {/* Column Header Card */}
                    <div className={`p-3 border rounded-xl font-bold text-xs tracking-wider uppercase text-center flex items-center justify-between px-4 ${col.color}`}>
                      <span>{col.label}</span>
                      <Badge variant="default" className="text-[9px] py-0 px-2 bg-zinc-950/60 border-zinc-800">
                        {colApps.length}
                      </Badge>
                    </div>

                    {/* Column Application List */}
                    <div className="flex flex-col gap-3">
                      {colApps.map(app => (
                        <div 
                          key={app.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setSelectedApp(app);
                            setShowDetailModal(true);
                          }}
                          className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-violet-500/30 hover:scale-[1.01] hover:shadow-lg transition-all group cursor-pointer select-none"
                        >
                          {/* Card Title Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-xs text-zinc-150 truncate leading-tight">{app.companyName}</h4>
                                {app.jobUrl && (
                                  <a 
                                    href={app.jobUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-violet-400 hover:text-violet-300 transition-colors shrink-0 cursor-pointer"
                                    title="Open Original Job Posting"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <h5 className="text-[10px] text-zinc-455 font-bold truncate mt-1">{app.roleTitle}</h5>
                            </div>
                            <Badge variant={getBadgeVariant(app.fitScore)} className="text-[9px] py-0 shrink-0 font-bold font-mono">
                              {app.fitScore.toFixed(1)}
                            </Badge>
                          </div>

                          {/* Notes Preview snippet */}
                          {app.notes && (
                            <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">
                              {app.notes}
                            </p>
                          )}

                          {/* Card footer actions */}
                          <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                            {/* Dropdown status fallback if dragging isn't supported */}
                            <select 
                              value={app.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className="bg-zinc-950 border border-zinc-850 text-zinc-400 font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-[9px]"
                            >
                              <option value="Evaluated">Evaluated</option>
                              <option value="Applied">Applied</option>
                              <option value="Responded">Responded</option>
                              <option value="Interview">Interview</option>
                              <option value="Offer">Offer</option>
                              <option value="Discarded">Discard</option>
                            </select>

                            <div className="flex items-center gap-2">
                              {app.jobUrl && (
                                <a 
                                  href={app.jobUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 hover:bg-zinc-800 text-violet-400 hover:text-violet-300 rounded transition-colors cursor-pointer"
                                  title="Open Original Job Posting"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteAppId(app.id); }}
                                className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                                title="Delete Card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {colApps.length === 0 && (
                        <div className="text-center py-10 text-[10px] text-zinc-600 border border-dashed border-zinc-800/80 rounded-xl select-none">
                          Drop Cards Here
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* RENDER TAB 2: JOB DISCOVERY (SCRApED JOB BANK) */}
      {activeTab === 'discovery' && (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in">
          
          {/* Scraper panel header card */}
          <Card className="flex flex-col gap-4 p-6" glass={true}>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400 animate-pulse" />
              SaaS Job Vacancy Discovery Aggregator
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Query multiple prominent job boards simultaneously in local headless sessions. Discovered jobs are parsed dynamically using your target master CV and assigned a compatibility match score before saving.
            </p>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-650">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchJobs();
                    }
                  }}
                  placeholder="Enter keywords to search (e.g. Node.js, Applied AI Engineer...)" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <Button 
                variant="primary"
                onClick={handleSearchJobs}
                disabled={searchingJobs || !searchQuery.trim()}
                isLoading={searchingJobs}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Scan Listings
              </Button>
            </div>
          </Card>

          {/* Paywall Alert Banner (SaaS growth mechanism) */}
          {paywallData && paywallData.locked && (
            <Card className="border-primary/20 bg-primary/5 p-5 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in" glass={false}>
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 text-primary shrink-0">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-100 mb-1">Free Tier Scan Threshold Reached</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                    {paywallData.message}
                  </p>
                </div>
              </div>
              <Button variant="primary" className="shrink-0 w-full md:w-auto">
                Upgrade to Pro Pipeline
              </Button>
            </Card>
          )}

          {/* Aggregated Scraped Listings grid */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map((match) => (
                <Card key={match.id} className="flex flex-col justify-between gap-4 p-5 hover:border-indigo-500/20 group" glass={true}>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Badge variant="primary" className="text-[8px] tracking-wide uppercase px-2 py-0 bg-zinc-950 font-bold border-zinc-800">
                          {match.job.platform}
                        </Badge>
                        <a 
                          href={match.job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-extrabold text-xs text-zinc-150 mt-2 truncate leading-tight hover:text-violet-400 hover:underline flex items-center gap-1 group/link cursor-pointer"
                        >
                          {match.job.title}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                        <h5 className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{match.job.company}</h5>
                      </div>
                      
                      <Badge variant={getBadgeVariant(match.fitScore)} className="shrink-0 text-[9px] py-0 font-bold font-mono">
                        {match.fitScore.toFixed(1)} Match
                      </Badge>
                    </div>

                    <div className="text-[10.5px] text-zinc-400/90 leading-relaxed line-clamp-4 font-normal">
                      {match.job.description}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 truncate max-w-[120px]">{match.job.location || 'Remote'}</span>
                    
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTrackScrapedJob(match)}
                      leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
                    >
                      Track Job
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : !searchingJobs && (
            <EmptyState
              title="Scan Vacant Positions"
              description="Input target engineering search terms above and scan Indonesia local listings aggregated with AI fit compatibility indexes."
              icon={<Search className="w-6 h-6 text-zinc-500" />}
            />
          )}

        </div>
      )}

      {/* add Application Modal / Dialog */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Job Application"
        maxWidth="md"
      >
        <form onSubmit={handleAddApplication} className="flex flex-col gap-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Company Name *</label>
              <input 
                type="text" 
                required 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Anthropic" 
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Role Title *</label>
              <input 
                type="text" 
                required 
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior AI Developer" 
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">AI Fit Score (1.0 - 5.0) *</label>
              <input 
                type="number" 
                step="0.1" 
                min="1.0" 
                max="5.0"
                required 
                value={fitScore}
                onChange={(e) => setFitScore(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Pipeline Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="Evaluated">Evaluated</option>
                <option value="Applied">Applied</option>
                <option value="Responded">Responded</option>
                <option value="Interview">Interviewing</option>
                <option value="Offer">Offer Received</option>
                <option value="Discarded">Discard / Skip</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Job Posting URL</label>
            <input 
              type="url" 
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://careers.example.com/jobs/123" 
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Notes & Match Highlights</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes on LLM auditor gaps or technical requirements..." 
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 h-24 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              Save Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reusable Delete Confirmation Modal */}
      <Modal
        isOpen={deleteAppId !== null}
        onClose={() => setDeleteAppId(null)}
        title="Confirm Application Deletion"
        maxWidth="sm"
      >
        <div className="text-xs text-zinc-400 space-y-4 font-sans leading-relaxed">
          <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-455 shrink-0" />
            <span>
              This operation is <strong>permanent</strong> and will delete all evaluation results, notes, and fit scores related to this job application.
            </span>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteAppId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteApplication}
              isLoading={deletingApp}
            >
              Delete Card
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unified Job Details & Workspace Modal */}
      <Modal
        isOpen={showDetailModal && selectedApp !== null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApp(null);
        }}
        title="Job Application Workspace"
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="flex flex-col gap-6 text-xs text-zinc-300 font-sans">
            
            {/* Header / Hero Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl">
              <div>
                <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  {selectedApp.companyName}
                </h3>
                <h4 className="text-xs font-bold text-zinc-450 mt-1">{selectedApp.roleTitle}</h4>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getBadgeVariant(selectedApp.fitScore)} className="text-[10px] px-3 py-1 font-bold font-mono">
                  {selectedApp.fitScore.toFixed(1)} Compatibility
                </Badge>
                
                {/* Current Pipeline Column Dropdown */}
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleUpdateApplicationDetails({ status: e.target.value })}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-350 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-[10.5px]"
                >
                  <option value="Evaluated">Evaluated</option>
                  <option value="Applied">Applied</option>
                  <option value="Responded">Responded</option>
                  <option value="Interview">Interviewing</option>
                  <option value="Offer">Offer Received</option>
                  <option value="Discarded">Skip / Closed</option>
                </select>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Details & Notes (3/5 width) */}
              <div className="md:col-span-3 flex flex-col gap-4">
                
                {/* Original Job Post URL Card */}
                <div className="bg-zinc-900/10 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-3">
                  <h4 className="font-extrabold text-[10px] uppercase text-zinc-450 tracking-wider flex items-center justify-between">
                    <span>Vacancy External Link</span>
                    <Globe className="w-3.5 h-3.5 text-zinc-550" />
                  </h4>
                  
                  {selectedApp.jobUrl ? (
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedApp.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 font-bold rounded-xl transition-all w-full truncate leading-normal"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{selectedApp.jobUrl}</span>
                      </a>
                      <button
                        onClick={() => {
                          const newUrl = prompt("Edit Job Vacancy Link:", selectedApp.jobUrl || '');
                          if (newUrl !== null) handleUpdateApplicationDetails({ jobUrl: newUrl || null });
                        }}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all cursor-pointer font-bold shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-550 italic">No job post URL configured.</span>
                      <button
                        onClick={() => {
                          const newUrl = prompt("Enter Job Vacancy Link:");
                          if (newUrl) handleUpdateApplicationDetails({ jobUrl: newUrl });
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-300 hover:underline font-bold transition-all ml-1 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  )}
                </div>

                {/* Applied Date details (only if status is Applied) */}
                {selectedApp.status.toLowerCase() === 'applied' && (
                  <div className="bg-zinc-900/10 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-3">
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-450 tracking-wider">
                      Application Log Details
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="text-[11px] text-zinc-400 font-medium">Applied on:</span>
                      <input
                        type="date"
                        value={selectedApp.appliedDate ? new Date(selectedApp.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleUpdateApplicationDetails({ appliedDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Notes & Description Area */}
                <div className="flex flex-col gap-2 flex-grow">
                  <label className="font-extrabold text-[10px] uppercase text-zinc-450 tracking-wider">Vacancy Description / Qualifications / Remarks</label>
                  <textarea
                    value={selectedApp.notes || ''}
                    onChange={(e) => handleUpdateApplicationDetails({ notes: e.target.value || null })}
                    placeholder="Paste the job qualifications, requirements, key search keywords, or dynamic application follow-up remarks here..."
                    className="w-full h-48 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 text-xs text-zinc-350 focus:outline-none focus:border-violet-500/30 resize-none leading-relaxed shadow-inner"
                  />
                </div>

              </div>

              {/* Right Column: Tailoring Status & Action Panel (2/5 width) */}
              <div className="md:col-span-2 flex flex-col gap-4">
                
                {/* CV Tailoring Hook Status Card */}
                <Card className="p-5 border-zinc-850 bg-zinc-950/20 flex flex-col gap-4 select-none h-full justify-between" glass={true}>
                  <div className="flex flex-col gap-3.5">
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-455 tracking-wider pb-2.5 border-b border-zinc-800/80">
                      CV Tailoring Workspace
                    </h4>
                    
                    {selectedApp.tailoredCv ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-extrabold text-[11px] text-zinc-200 block mb-0.5">Custom Tailored CV Active</span>
                            <span className="text-zinc-450 text-[10px] leading-relaxed block">This application is loaded with a target-optimized custom resume revision.</span>
                          </div>
                        </div>

                        {/* Tailored ATS Score Widget */}
                        <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                          <span className="text-[11px] text-zinc-400 font-medium">Tailored ATS Score:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-emerald-400 font-mono">
                              {selectedApp.tailoredAtsScore || 95}
                            </span>
                            <span className="text-[10px] text-zinc-550 font-bold">/100</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-zinc-550 shrink-0" />
                          <div>
                            <span className="font-extrabold text-[11px] text-zinc-450 block mb-0.5">Using Master CV</span>
                            <span className="text-zinc-500 text-[10px] leading-relaxed block">No targeted resume tailor revision is created yet. Applying with Master CV may lower match odds.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-900">
                    <a
                      href={`/dashboard/cv?appId=${selectedApp.id}`}
                      className="flex items-center justify-center gap-2.5 w-full bg-violet-500 hover:bg-violet-400 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-500/10 select-none text-center"
                    >
                      <Sparkles className="w-4 h-4 text-black font-black animate-pulse" />
                      {selectedApp.tailoredCv ? "Open Tailoring Studio" : "Tailor CV for this Job"}
                    </a>
                    
                    <p className="text-[9.5px] text-zinc-550 text-center leading-normal">
                      Redirects to Tailoring Studio, auto-selecting this company context for granular bullet optimization.
                    </p>
                  </div>
                </Card>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-900 select-none">
              <button
                onClick={() => {
                  setDeleteAppId(selectedApp.id);
                  setShowDetailModal(false);
                }}
                className="flex items-center gap-1 text-[11px] text-zinc-550 hover:text-rose-455 font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Application
              </button>
              
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApp(null);
                }}
              >
                Close Workspace
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
