'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Tags,
  Briefcase
} from 'lucide-react';
import { toast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { EmptyState } from '../../components/ui/empty-state';

interface Story {
  id: string;
  title: string;
  starSituation: string;
  starTask: string;
  starAction: string;
  starResult: string;
  reflection: string | null;
  archetypeTags: string; // JSON string of string[]
  createdAt: string;
}

const ARCHETYPES = [
  'Problem Solving',
  'Technical Leadership',
  'Conflict Resolution',
  'Innovation & Architecture',
  'Teamwork & Collaboration',
  'Customer Obsession'
];

export default function StoryBank() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Expand/Collapse state
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Form states for manual Add / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSituation, setFormSituation] = useState('');
  const [formTask, setFormTask] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formResult, setFormResult] = useState('');
  const [formReflection, setFormReflection] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);

  // Deletion Modal States
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
  const [deletingStory, setDeletingStory] = useState(false);

  // AI Generation Confirmation Modal State
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  // Fetch stories from SQLite
  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stories');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setStories(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch STAR Story Bank.');
      toast.error('Failed to load STAR Story Bank', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Trigger AI Generator from Master CV
  const handleGenerateFromCv = async () => {
    setShowGenerateConfirm(false);
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/stories/generate', { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success('STAR Stories generated successfully! ✨', {
        description: 'Analyzed your master CV and added 3 tailored interview stories.',
        duration: 4500
      });
      fetchStories();
    } catch (err: any) {
      toast.error('AI generation failed', { description: err.message });
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Create or Update STAR Story
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSituation.trim() || !formTask.trim() || !formAction.trim() || !formResult.trim()) {
      toast.warning('Incomplete form', { description: 'All STAR method fields are required.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        starSituation: formSituation,
        starTask: formTask,
        starAction: formAction,
        starResult: formResult,
        reflection: formReflection || null,
        archetypeTags: formTags
      };

      let res;
      if (editingStoryId) {
        // Edit existing story
        res = await fetch(`/api/stories/${editingStoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new story
        res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      closeFormModal();
      fetchStories();
      toast.success(editingStoryId ? 'STAR story updated successfully!' : 'STAR story added successfully!');

    } catch (err: any) {
      toast.error('Failed to save story', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Delete Story
  const handleDeleteStory = async () => {
    if (!deleteStoryId) return;
    setDeletingStory(true);
    try {
      const res = await fetch(`/api/stories/${deleteStoryId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setStories(prev => prev.filter(s => s.id !== deleteStoryId));
      if (expandedStoryId === deleteStoryId) setExpandedStoryId(null);
      toast.success('STAR story deleted successfully.');
      setDeleteStoryId(null);
    } catch (err: any) {
      toast.error('Failed to delete story', { description: err.message });
    } finally {
      setDeletingStory(false);
    }
  };

  // Open Form Modal for Create or Edit
  const openFormModal = (story?: Story) => {
    if (story) {
      setEditingStoryId(story.id);
      setFormTitle(story.title);
      setFormSituation(story.starSituation);
      setFormTask(story.starTask);
      setFormAction(story.starAction);
      setFormResult(story.starResult);
      setFormReflection(story.reflection || '');
      try {
        setFormTags(JSON.parse(story.archetypeTags));
      } catch {
        setFormTags([]);
      }
    } else {
      setEditingStoryId(null);
      setFormTitle('');
      setFormSituation('');
      setFormTask('');
      setFormAction('');
      setFormResult('');
      setFormReflection('');
      setFormTags([]);
    }
    setShowFormModal(true);
  };

  // Close Form Modal
  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingStoryId(null);
  };

  // Toggle tag in form state
  const handleToggleTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(prev => prev.filter(t => t !== tag));
    } else {
      setFormTags(prev => [...prev, tag]);
    }
  };

  // Parse tags helper
  const parseTags = (tagsStr: string): string[] => {
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  // Render tag badge styling
  const getTagBadgeVariant = (tag: string) => {
    switch (tag) {
      case 'Problem Solving': return 'warning';
      case 'Technical Leadership': return 'primary';
      case 'Conflict Resolution': return 'danger';
      case 'Innovation & Architecture': return 'info';
      case 'Teamwork & Collaboration': return 'success';
      default: return 'default';
    }
  };

  // Filtered stories list
  const filteredStories = selectedTagFilter 
    ? stories.filter(s => parseTags(s.archetypeTags).includes(selectedTagFilter))
    : stories;

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      
      {/* 1. Page Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            STAR Story Bank
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Structure and record your best career achievements using the STAR methodology to ace behavioral interviews.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none">
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setShowGenerateConfirm(true)}
            disabled={generating || loading}
            isLoading={generating}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate from CV
          </Button>

          <Button 
            variant="primary"
            size="sm"
            onClick={() => openFormModal()}
            disabled={loading}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add STAR Story
          </Button>
        </div>
      </div>

      {/* 2. Educational Hero Banner */}
      <Card className="flex flex-col md:flex-row gap-5 items-start justify-between p-5" glass={true}>
        <div className="flex gap-4 items-start flex-1">
          <div className="bg-indigo-500/10 border border-indigo-500/15 p-3 rounded-2xl text-indigo-400 shrink-0 mt-0.5 select-none">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-zinc-200 mb-1 flex items-center gap-2 select-none">
              What is a STAR Story Bank?
              <HelpCircle className="w-3.5 h-3.5 text-zinc-550" />
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl font-normal">
              Behavioral interviews evaluate your competency through past achievements (e.g., <em>&quot;Tell me about a time you solved a critical bug under pressure...&quot;</em>). To construct highly impactful responses, record your key career milestones in the <strong>STAR structure (Situation, Task, Action, Result)</strong>. This bank serves as your personal vault to store and master these interview stories!
            </p>
          </div>
        </div>
        <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-3.5 text-[10px] space-y-1.5 shrink-0 max-w-xs w-full md:w-auto font-sans leading-relaxed select-none">
          <div className="font-black text-indigo-400 uppercase tracking-wider">🌟 The STAR Formula:</div>
          <div><strong className="text-zinc-200">S - Situation:</strong> Establish context & current challenges.</div>
          <div><strong className="text-zinc-200">T - Task:</strong> The specific goal, objective, or constraints.</div>
          <div><strong className="text-zinc-200">A - Action:</strong> Step-by-step actions that <strong>YOU</strong> executed.</div>
          <div><strong className="text-zinc-200">R - Result:</strong> Quantifiable business impact and metrics.</div>
        </div>
      </Card>

      {/* 3. Tag filters row */}
      {stories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs pb-2.5 border-b border-zinc-900 select-none">
          <span className="text-zinc-500 font-bold flex items-center gap-1">
            <Tags className="w-3.5 h-3.5" />
            Filter by Archetype:
          </span>
          <button 
            onClick={() => setSelectedTagFilter(null)}
            className={`px-3 py-1 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${!selectedTagFilter ? 'bg-primary border-primary text-primary-foreground font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
          >
            All Stories ({stories.length})
          </button>
          {ARCHETYPES.map(tag => {
            const count = stories.filter(s => parseTags(s.archetypeTags).includes(tag)).length;
            if (count === 0) return null;
            return (
              <button 
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-3 py-1 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${selectedTagFilter === tag ? 'bg-primary border-primary text-primary-foreground font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-455 p-6 max-w-xl mx-auto flex items-center gap-3 shrink-0" glass={false}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Error parsing stories: {error}</span>
        </Card>
      )}

      {/* MAIN STORY BANK SECTION */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin text-primary h-8 w-8" />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          title="STAR Story Vault is Empty"
          description="You have not added any interview stories yet. Have our AI scan your Master CV to generate 3 tailored behavioral STAR stories automatically, or add them manually."
          icon={<BookOpen className="w-6 h-6 text-zinc-500" />}
          action={
            <div className="flex gap-3">
              <Button 
                variant="primary"
                onClick={() => setShowGenerateConfirm(true)}
                disabled={generating}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate from CV
              </Button>
              <Button 
                variant="secondary"
                onClick={() => openFormModal()}
              >
                Add Manually
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12 border border-zinc-850 rounded-2xl text-xs text-zinc-500 select-none">
              No STAR stories found matching this archetype tag.
            </div>
          ) : (
            filteredStories.map(story => {
              const tags = parseTags(story.archetypeTags);
              const isExpanded = expandedStoryId === story.id;
              
              return (
                <Card 
                  key={story.id} 
                  onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                  className="p-5 flex flex-col gap-3.5 group select-none relative"
                  glass={true}
                  hoverable={!isExpanded}
                >
                  
                  {/* Card Title & Header Details */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-zinc-150 text-xs md:text-sm tracking-tight truncate max-w-[300px] md:max-w-md">{story.title}</h4>
                        {tags.map((t, idx) => (
                          <Badge 
                            key={idx} 
                            variant={getTagBadgeVariant(t)}
                            className="text-[9px] py-0 px-2 font-bold font-sans"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold font-sans">
                        Added on {new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Expand/Delete Action triggers */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openFormModal(story);
                        }}
                        className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit Story"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteStoryId(story.id);
                        }}
                        className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-rose-500/30 text-zinc-400 hover:text-rose-455 rounded-lg transition-colors cursor-pointer"
                        title="Delete Story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-zinc-500 hover:text-zinc-300 ml-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Summary Snippet view when collapsed */}
                  {!isExpanded && (
                    <p className="text-xs text-zinc-450 leading-relaxed truncate font-normal">
                      <strong className="text-primary font-bold mr-1">Situation:</strong> {story.starSituation}
                    </p>
                  )}

                  {/* EXPANDED STAR STRUCTURE GRID */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-zinc-850/80 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in font-sans leading-relaxed text-zinc-300">
                      
                      {/* S - Situation */}
                      <Card className="p-4 flex flex-col gap-2 bg-zinc-950/20 border-zinc-850" glass={false}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400 font-sans">S - Situation</span>
                          <Badge variant="primary" className="text-[8px] py-0 font-bold px-1.5">Context</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 font-normal leading-relaxed whitespace-pre-wrap">{story.starSituation}</p>
                      </Card>

                      {/* T - Task */}
                      <Card className="p-4 flex flex-col gap-2 bg-zinc-950/20 border-zinc-850" glass={false}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black tracking-wider text-purple-450 font-sans">T - Task</span>
                          <Badge variant="primary" className="text-[8px] py-0 font-bold px-1.5">Objectives</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 font-normal leading-relaxed whitespace-pre-wrap">{story.starTask}</p>
                      </Card>

                      {/* A - Action */}
                      <Card className="p-4 flex flex-col gap-2 bg-zinc-950/20 border-zinc-850" glass={false}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black tracking-wider text-amber-450 font-sans">A - Action</span>
                          <Badge variant="primary" className="text-[8px] py-0 font-bold px-1.5">Execution</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 font-normal leading-relaxed whitespace-pre-wrap">{story.starAction}</p>
                      </Card>

                      {/* R - Result */}
                      <Card className="p-4 flex flex-col gap-2 bg-emerald-500/5 border-emerald-500/10" glass={false}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black tracking-wider text-emerald-450 font-sans">R - Result</span>
                          <Badge variant="success" className="text-[8px] py-0 font-bold px-1.5">Impact</Badge>
                        </div>
                        <p className="text-xs text-emerald-100 font-medium leading-relaxed whitespace-pre-wrap">{story.starResult}</p>
                      </Card>

                      {/* Reflection block (takeaway) if present */}
                      {story.reflection && (
                        <div className="md:col-span-4 p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex gap-3 items-center">
                          <Badge variant="info" className="text-[8px] tracking-wide uppercase px-2 py-0.5 shrink-0 font-bold font-sans">
                            Key Takeaway
                          </Badge>
                          <p className="text-xs text-zinc-450 italic font-normal">
                            &quot;{story.reflection}&quot;
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </Card>
              );
            })
          )}

        </div>
      )}

      {/* FORM MODAL: CREATE OR EDIT STAR STORY */}
      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={closeFormModal}
          title={editingStoryId ? 'Update STAR Interview Story' : 'Create New STAR Story'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 text-xs font-sans">
            
            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Achievement / Story Title *</label>
              <input 
                type="text" 
                required 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Optimizing Server-Side Render Times in Next.js Core Dashboard APIs" 
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Tag Selector */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px] flex items-center gap-1.5">
                Competency Archetype Tags
                <span className="text-[9.5px] text-zinc-550 font-normal font-sans lowercase">(select matching competencies)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ARCHETYPES.map(tag => {
                  const isSelected = formTags.includes(tag);
                  return (
                    <button 
                      type="button"
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 border rounded-lg text-[9.5px] font-bold cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground font-black' : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAR inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Situation */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-indigo-400 uppercase tracking-wide text-[9px]">S - Situation (Context & Challenge) *</label>
                <textarea 
                  required 
                  value={formSituation}
                  onChange={(e) => setFormSituation(e.target.value)}
                  placeholder="Establish background. e.g., Our legacy dashboard page suffered from a 2.4s render lag, leading to a 15% drop-off in user engagement..." 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 placeholder:text-zinc-700 focus:outline-none focus:border-primary/45 h-28 resize-none leading-relaxed"
                />
              </div>

              {/* Task */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-purple-450 uppercase tracking-wide text-[9px]">T - Task (Objective & Goals) *</label>
                <textarea 
                  required 
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                  placeholder="Identify goals. e.g., I was tasked to overhaul the API schema, minimize response latencies under 500ms, and scale database query layers..." 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 placeholder:text-zinc-700 focus:outline-none focus:border-primary/45 h-28 resize-none leading-relaxed"
                />
              </div>

              {/* Action */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-amber-450 uppercase tracking-wide text-[9px]">A - Action (Your Step-by-Step Executions) *</label>
                <textarea 
                  required 
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  placeholder="Detail actions you took. e.g., I rewrote database queries using custom index joins in Prisma, implemented server redis caching, and structured stream loads..." 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 placeholder:text-zinc-700 focus:outline-none focus:border-primary/45 h-28 resize-none leading-relaxed"
                />
              </div>

              {/* Result */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-emerald-450 uppercase tracking-wide text-[9px]">R - Result (Impact & Metric Outcomes) *</label>
                <textarea 
                  required 
                  value={formResult}
                  onChange={(e) => setFormResult(e.target.value)}
                  placeholder="Quantify impact. e.g., Average response latency dropped to 380ms (84% speed improvement), user page retentions increased by 12%..." 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 placeholder:text-zinc-700 focus:outline-none focus:border-primary/45 h-28 resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Reflection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Reflection / Lesson Learned (Optional)</label>
              <input 
                type="text" 
                value={formReflection}
                onChange={(e) => setFormReflection(e.target.value)}
                placeholder="e.g., Combining cache states with database indexes is critical for scaling high-frequency real-time dashboard analytics..." 
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Form actions */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3 select-none">
              <Button
                variant="secondary"
                onClick={closeFormModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                type="submit"
                isLoading={saving}
              >
                Save STAR Story
              </Button>
            </div>

          </form>
        </Modal>
      )}

      {/* AI GENERATION CONFIRMATION MODAL */}
      <Modal
        isOpen={showGenerateConfirm}
        onClose={() => setShowGenerateConfirm(false)}
        title="Confirm AI STAR Story Generation"
        maxWidth="md"
      >
        <div className="text-xs text-zinc-450 space-y-4 font-sans leading-relaxed">
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 p-3 rounded-xl select-none">
            <Sparkles className="w-5 h-5 text-primary shrink-0 animate-pulse mt-0.5" />
            <span>
              Our AI engine will analyze your **Master CV** experience items, extract real accomplishments, and automatically construct **3 tailored STAR behavioral interview stories** inside your database.
            </span>
          </div>
          
          <p className="font-normal text-zinc-450">
            This operation will call your OpenAI key in a highly cached context. Generating new stories takes about 5-8 seconds. Ready to proceed?
          </p>

          <div className="flex justify-end gap-3 pt-2 select-none">
            <Button
              variant="secondary"
              onClick={() => setShowGenerateConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateFromCv}
              isLoading={generating}
            >
              Start AI Generation
            </Button>
          </div>
        </div>
      </Modal>

      {/* REUSABLE DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteStoryId !== null}
        onClose={() => setDeleteStoryId(null)}
        title="Delete STAR Story"
        maxWidth="sm"
      >
        <div className="text-xs text-zinc-400 space-y-4 font-sans leading-relaxed">
          <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl select-none">
            <AlertTriangle className="w-5 h-5 text-rose-455 shrink-0" />
            <span>
              This operation is <strong>permanent</strong> and will delete this STAR behavioral story, including situation context, action steps, and quantitative results, from your Story Bank vault.
            </span>
          </div>
          
          <div className="flex justify-end gap-3 pt-2 select-none">
            <Button
              variant="secondary"
              onClick={() => setDeleteStoryId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteStory}
              isLoading={deletingStory}
            >
              Delete Story
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
