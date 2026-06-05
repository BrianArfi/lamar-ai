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
  Cpu, 
  RefreshCw,
  Award,
  Video,
  FileCheck,
  ExternalLink,
  Sparkles,
  Puzzle
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
  location?: string | null;
  workSetting?: string | null;
  appliedDate?: string | null;
  tailoredCv?: string | null;
  tailoredCvSkills?: string | null;
  tailoredAtsScore?: number | null;
  createdAt: string;
}

const COLUMNS = [
  { name: 'Evaluated', label: 'Evaluated', color: 'border-zinc-800 bg-zinc-900/10 text-zinc-400' },
  { name: 'Applied', label: 'Applied', color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400' },
  { name: 'Responded', label: 'Responded', color: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400' },
  { name: 'Interview', label: 'Interviewing', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400' },
  { name: 'Offer', label: 'Offer Received', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
  { name: 'Discarded', label: 'Skip / Closed', color: 'border-rose-500/20 bg-rose-500/5 text-rose-400' }
];

const INDO_PORTALS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', category: 'Corporate' },
  { name: 'Glints ID', url: 'https://glints.com/id/opportunities/jobs', category: 'Tech/Startup' },
  { name: 'Kalibrr ID', url: 'https://www.kalibrr.com/job-board/co/Indonesia/1', category: 'Tech' },
  { name: 'JobStreet ID', url: 'https://www.jobstreet.co.id/', category: 'General' },
  { name: 'Indeed ID', url: 'https://id.indeed.com/', category: 'Aggregator' },
  { name: 'Tech in Asia Jobs', url: 'https://www.techinasia.com/jobs', category: 'Startups' }
];

export default function TrackerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drag & Drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);

  // Kanban board filter states
  const [pipelineWorkSettingFilter, setPipelineWorkSettingFilter] = useState<string>('All');
  const [pipelineLocationFilter, setPipelineLocationFilter] = useState<string>('');

  // Add Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [fitScore, setFitScore] = useState('4.0');
  const [status, setStatus] = useState('Evaluated');
  const [notes, setNotes] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appWorkSetting, setAppWorkSetting] = useState('Onsite');

  // Delete Confirmation Modal State
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [deletingApp, setDeletingApp] = useState(false);

  // Job Details Modal States
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Extension sync info modal
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [syncToken, setSyncToken] = useState('');

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

  // Fetch sync token
  const fetchSyncToken = async () => {
    try {
      const res = await fetch('/api/auth/token');
      const json = await res.json();
      if (json.success && json.syncToken) {
        setSyncToken(json.syncToken);
      }
    } catch (e) {
      console.error('Failed to fetch sync token:', e);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchSyncToken();
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
          notes: notes || null,
          location: appLocation || null,
          workSetting: appWorkSetting
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setCompanyName('');
      setRoleTitle('');
      setNotes('');
      setJobUrl('');
      setAppLocation('');
      setAppWorkSetting('Onsite');
      setFitScore('4.0');
      setStatus('Evaluated');
      setShowAddModal(false);
      
      toast.success('Application added manually!');
      fetchApplications();
    } catch (err: any) {
      toast.error('Failed to create application', { description: err.message });
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
      
      {/* Header controls and manually add buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Applications Board
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">Manage and track your active job vacancies in a responsive pipeline dashboard.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setShowExtensionModal(true)}
            leftIcon={<Puzzle className="w-4 h-4 text-violet-400" />}
          >
            Extension Setup
          </Button>

          <Button 
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Job Manually
          </Button>
        </div>
      </div>

      {/* Top Statistic Cards Row */}
      {totalApps > 0 && (
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
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider block">{stat.label}</span>
                  <span className="text-2xl font-bold font-mono text-zinc-150 block mt-1">{stat.val}</span>
                </div>
                <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Kanban Board Container */}
      {loading && applications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin text-primary h-8 w-8" />
        </div>
      ) : error ? (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-450 p-6 max-w-xl mx-auto flex items-center gap-3" glass={false}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Failed to sync with local database: {error}</span>
        </Card>
      ) : applications.length === 0 ? (
        <div className="max-w-4xl mx-auto w-full py-10 flex flex-col gap-8 animate-fade-in select-none">
          <EmptyState
            title="SaaS Kanban Board is Empty"
            description="Manually insert a tracking card or browse local Indonesian boards and click the Chrome Extension to scrape listings in 1-click."
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
          
          {/* visual extension callout with Indonesian boards */}
          <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-2xl flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-extrabold text-zinc-200 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-violet-400" />
                Recommended Chrome Extension Discovery Flow
              </h4>
              <p className="text-xs text-zinc-550 mt-1 leading-normal">
                Avoid copy-paste fatigue. Navigate directly to Indonesian career portals and use the Career-Ops scraper sidebar to load CV tailoring.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {INDO_PORTALS.map((portal, idx) => (
                <a 
                  key={idx}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-900 bg-zinc-900/10 p-3 rounded-xl hover:border-zinc-700 transition-all text-center flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xs font-bold text-zinc-350 group-hover:text-violet-400 transition-colors">{portal.name}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{portal.category}</span>
                </a>
              ))}
            </div>

            <div className="border-t border-zinc-900 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs text-zinc-550">
                Sync Key is configured. Click the button to read your sync code details.
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowExtensionModal(true)}
                leftIcon={<Puzzle className="w-3.5 h-3.5" />}
              >
                Show Extension Instructions
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 w-full">
          {/* Kanban Board Filtering Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-2 self-start text-xs uppercase font-bold text-zinc-400 tracking-wider">
              <Search className="w-3.5 h-3.5 text-zinc-550" />
              <span>Filter Board</span>
            </div>
            
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              <div className="relative w-full sm:max-w-xs">
                <input 
                  type="text" 
                  value={pipelineLocationFilter}
                  onChange={(e) => setPipelineLocationFilter(e.target.value)}
                  placeholder="Filter by location (e.g. Jakarta)" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-zinc-400 font-bold whitespace-nowrap">Arrangement:</span>
                <select
                  value={pipelineWorkSettingFilter}
                  onChange={(e) => setPipelineWorkSettingFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-855 text-zinc-400 font-semibold rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer w-full sm:w-auto"
                >
                  <option value="All">All Settings</option>
                  <option value="Onsite">Onsite Only</option>
                  <option value="Hybrid">Hybrid Only</option>
                  <option value="Remote">Remote Only</option>
                </select>
              </div>

              {(pipelineLocationFilter || pipelineWorkSettingFilter !== 'All') && (
                <button
                  onClick={() => {
                    setPipelineLocationFilter('');
                    setPipelineWorkSettingFilter('All');
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer self-end sm:self-auto sm:ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Columns Horizontal Scroll container */}
          <div className="flex flex-row overflow-x-auto gap-5 pb-4 md:grid md:grid-cols-2 xl:grid-cols-6 items-start scrollbar-thin scrollbar-thumb-zinc-850">
            {COLUMNS.map(col => {
              const colApps = applications
                .filter(app => app.status.toLowerCase() === col.name.toLowerCase())
                .filter(app => {
                  if (pipelineWorkSettingFilter !== 'All') {
                    const appSetting = app.workSetting || 'Onsite';
                    if (appSetting.toLowerCase() !== pipelineWorkSettingFilter.toLowerCase()) {
                      return false;
                    }
                  }
                  if (pipelineLocationFilter.trim() !== '') {
                    const appLoc = (app.location || '').toLowerCase();
                    if (!appLoc.includes(pipelineLocationFilter.toLowerCase())) {
                      return false;
                    }
                  }
                  return true;
                });
              const isDragOver = activeDragCol === col.name;
              
              return (
                <div 
                  key={col.name} 
                  onDragOver={(e) => handleDragOverCol(e, col.name)}
                  onDragLeave={handleDragLeaveCol}
                  onDrop={(e) => handleDropCol(e, col.name)}
                  className={`flex flex-col gap-4 min-h-[550px] w-64 md:w-auto shrink-0 transition-all rounded-2xl p-2 border-2 border-transparent ${
                    isDragOver ? 'drag-over-column' : ''
                  }`}
                >
                  {/* Column Header Card */}
                  <div className={`p-3 border rounded-xl font-bold text-sm tracking-wider uppercase text-center flex items-center justify-between px-4 ${col.color}`}>
                    <span>{col.label}</span>
                    <Badge variant="default" className="text-xs py-0.5 px-2 bg-zinc-950/60 border-zinc-805">
                      {colApps.length}
                    </Badge>
                  </div>

                  {/* Column Application Cards */}
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-base text-zinc-150 truncate leading-tight">{app.companyName}</h4>
                              {app.jobUrl && (
                                <a 
                                  href={app.jobUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-violet-400 hover:text-violet-300 transition-colors shrink-0 cursor-pointer"
                                  title="Open Original Job Posting"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <h5 className="text-sm text-zinc-400 font-bold truncate mt-1">{app.roleTitle}</h5>
                          </div>
                          <Badge variant={getBadgeVariant(app.fitScore)} className="text-sm py-0.5 px-2 shrink-0 font-bold font-mono">
                            {app.fitScore.toFixed(1)}
                          </Badge>
                        </div>

                        {app.notes && (
                          <p className="text-sm text-zinc-450 leading-relaxed line-clamp-2">
                            {app.notes}
                          </p>
                        )}

                        {(app.location || app.workSetting) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {app.workSetting && (
                              <Badge variant="default" className="text-xs py-0.5 px-2 bg-zinc-950 border-zinc-800 text-zinc-450 font-bold">
                                {app.workSetting}
                              </Badge>
                            )}
                            {app.location && (
                              <span className="text-sm text-zinc-450 truncate max-w-[170px]">
                                📍 {app.location}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                          <select 
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-850 text-zinc-400 font-semibold rounded px-2 py-1 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-sm"
                          >
                            <option value="Evaluated">Evaluated</option>
                            <option value="Applied">Applied</option>
                            <option value="Responded">Responded</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Discarded">Discard</option>
                          </select>

                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteAppId(app.id); }}
                            className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {colApps.length === 0 && (
                      <div className="text-center py-10 text-[10px] text-zinc-650 border border-dashed border-zinc-800/80 rounded-xl select-none">
                        Drop Cards Here
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reusable Delete Confirmation Modal */}
      <Modal
        isOpen={deleteAppId !== null}
        onClose={() => setDeleteAppId(null)}
        title="Confirm Application Deletion"
        maxWidth="sm"
      >
        <div className="text-xs text-zinc-400 space-y-4 font-sans leading-relaxed">
          <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-450 shrink-0" />
            <span>
              This operation is <strong>permanent</strong> and will delete all evaluation results, notes, and fit scores related to this job application.
            </span>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteAppId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteApplication} isLoading={deletingApp}>
              Delete Card
            </Button>
          </div>
        </div>
      </Modal>

      {/* Extension Info Modal */}
      <Modal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        title="Connect Chrome Extension Settings"
        maxWidth="sm"
      >
        <div className="text-xs text-zinc-450 space-y-4 font-sans leading-relaxed select-none">
          <p>
            Copy the <b>Sync Token</b> below and paste it in the settings section of your Career-Ops Chrome Extension. This syncs your local browser scraping and form auto-filler directly with this dashboard:
          </p>
          
          <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-3 rounded-xl font-mono text-xs text-zinc-350 select-all overflow-x-auto truncate flex items-center justify-between">
            <span>{syncToken || 'Loading sync key...'}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(syncToken);
                toast.success('Sync Token copied!');
              }}
            >
              Copy
            </Button>
          </div>

          <div className="border-t border-zinc-900 pt-3 space-y-2">
            <span className="font-bold text-zinc-350 block">How to Load Local Extension:</span>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Open chrome://extensions in Chrome.</li>
              <li>Toggle "Developer mode" on.</li>
              <li>Click "Load unpacked" and select the extension directory.</li>
              <li>Open any job detail page and start importing!</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setShowExtensionModal(false)}>
              Got it!
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
          <div className="flex flex-col gap-6 text-sm text-zinc-350 font-sans">
            
            {/* Header / Hero Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  {selectedApp.companyName}
                </h3>
                <h4 className="text-sm font-bold text-zinc-400 mt-1">{selectedApp.roleTitle}</h4>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getBadgeVariant(selectedApp.fitScore)} className="text-xs px-3 py-1 font-bold font-mono">
                  {selectedApp.fitScore.toFixed(1)} Compatibility
                </Badge>
                
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleUpdateApplicationDetails({ status: e.target.value })}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-350 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-xs"
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
              
              {/* Left Column */}
              <div className="md:col-span-3 flex flex-col gap-4">
                
                <div className="bg-zinc-900/10 border border-zinc-855 rounded-2xl p-4 flex flex-col gap-3">
                  <h4 className="font-extrabold text-xs uppercase text-zinc-400 tracking-wider flex items-center justify-between">
                    <span>Vacancy External Link</span>
                    <Globe className="w-3.5 h-3.5 text-zinc-550" />
                  </h4>
                  
                  {selectedApp.jobUrl ? (
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedApp.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 font-bold rounded-xl transition-all w-full truncate leading-normal text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{selectedApp.jobUrl}</span>
                      </a>
                      <button
                        onClick={() => {
                          const newUrl = prompt("Edit Job Vacancy Link:", selectedApp.jobUrl || '');
                          if (newUrl !== null) handleUpdateApplicationDetails({ jobUrl: newUrl || null });
                        }}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all cursor-pointer font-bold shrink-0 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 italic">No job post URL configured.</span>
                      <button
                        onClick={() => {
                          const newUrl = prompt("Enter Job Vacancy Link:");
                          if (newUrl) handleUpdateApplicationDetails({ jobUrl: newUrl });
                        }}
                        className="text-xs text-violet-400 hover:text-violet-300 hover:underline font-bold transition-all ml-1 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/10 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-3">
                  <h4 className="font-extrabold text-xs uppercase text-zinc-400 tracking-wider">
                    Location & Work Setting
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase">Location</span>
                      <input
                        type="text"
                        value={selectedApp.location || ''}
                        onChange={(e) => handleUpdateApplicationDetails({ location: e.target.value || null })}
                        placeholder="e.g. Jakarta, Indonesia"
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500/50 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase">Work Setting</span>
                      <select
                        value={selectedApp.workSetting || 'Onsite'}
                        onChange={(e) => handleUpdateApplicationDetails({ workSetting: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer text-xs"
                      >
                        <option value="Onsite">Onsite</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>
                </div>

                {selectedApp.status.toLowerCase() === 'applied' && (
                  <div className="bg-zinc-900/10 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-3">
                    <h4 className="font-extrabold text-xs uppercase text-zinc-400 tracking-wider">
                      Application Log Details
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="text-xs text-zinc-400 font-medium">Applied on:</span>
                      <input
                        type="date"
                        value={selectedApp.appliedDate ? new Date(selectedApp.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleUpdateApplicationDetails({ appliedDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-grow">
                  <label className="font-extrabold text-xs uppercase text-zinc-400 tracking-wider">Vacancy Description / Qualifications / Remarks</label>
                  <textarea
                    value={selectedApp.notes || ''}
                    onChange={(e) => handleUpdateApplicationDetails({ notes: e.target.value || null })}
                    placeholder="Paste the job qualifications, requirements, key search keywords, or dynamic application follow-up remarks here..."
                    className="w-full h-48 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/30 resize-none leading-relaxed shadow-inner"
                  />
                </div>

              </div>

              {/* Right Column */}
              <div className="md:col-span-2 flex flex-col gap-4">
                
                <Card className="p-5 border-zinc-855 bg-zinc-950/20 flex flex-col gap-4 select-none h-full justify-between" glass={true}>
                  <div className="flex flex-col gap-3.5">
                    <h4 className="font-extrabold text-xs uppercase text-zinc-400 tracking-wider pb-2.5 border-b border-zinc-800/80">
                      CV Tailoring Workspace
                    </h4>
                    
                    {selectedApp.tailoredCv ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-extrabold text-xs text-zinc-200 block mb-0.5">Custom Tailored CV Active</span>
                            <span className="text-zinc-400 text-xs leading-relaxed block">This application is loaded with a target-optimized custom resume revision.</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                          <span className="text-xs text-zinc-400 font-medium">Tailored ATS Score:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-emerald-400 font-mono">
                              {selectedApp.tailoredAtsScore || 95}
                            </span>
                            <span className="text-xs text-zinc-550 font-bold">/100</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-zinc-550 shrink-0" />
                          <div>
                            <span className="font-extrabold text-xs text-zinc-400 block mb-0.5">Using Master CV</span>
                            <span className="text-zinc-450 text-xs leading-relaxed block">No targeted resume tailor revision is created yet. Applying with Master CV may lower match odds.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-900">
                    <a
                      href={`/dashboard/cv?appId=${selectedApp.id}`}
                      className="flex items-center justify-center gap-2.5 w-full bg-violet-500 hover:bg-violet-400 text-black font-extrabold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-500/10 select-none text-center"
                    >
                      <Sparkles className="w-4 h-4 text-black font-black animate-pulse" />
                      {selectedApp.tailoredCv ? "Open Tailoring Studio" : "Tailor CV for this Job"}
                    </a>
                    
                    <p className="text-xs text-zinc-500 text-center leading-normal">
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
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 font-bold transition-all cursor-pointer"
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
