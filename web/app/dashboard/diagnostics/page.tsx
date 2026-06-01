'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Trash2, 
  Globe, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  FileCode, 
  HelpCircle, 
  Lightbulb,
  Terminal,
  Cpu
} from 'lucide-react';

interface ScraperReport {
  id: string;
  url: string;
  host: string;
  platform: string | null;
  source: string; // "SERVER_SIDE" | "CHROME_EXTENSION"
  failureType: string; // "SKELETON_DETECTED" | "ANTI_BOT_BLOCKED" | "SELECTOR_MISSING" | "NETWORK_ERROR"
  errorMessage: string;
  htmlSnippet: string | null;
  createdAt: string;
}

export default function ScraperDiagnostics() {
  const [reports, setReports] = useState<ScraperReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [selectedHostFilter, setSelectedHostFilter] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);

  // Fetch failure reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/scraper/report-failure');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReports(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch diagnostics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Clear all failure logs
  const handleClearLogs = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA log laporan diagnostik kegagalan scraping secara permanen dari SQLite?')) return;

    setClearing(true);
    try {
      const res = await fetch('/api/scraper/report-failure', { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setReports([]);
      setExpandedReportId(null);
      alert('Semua riwayat kegagalan scraper berhasil dibersihkan!');
    } catch (err: any) {
      alert('Gagal membersihkan log: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  // Get smart debugging remedy advice based on error type and source
  const getSmartRemedyAdvice = (report: ScraperReport) => {
    switch (report.failureType) {
      case 'ANTI_BOT_BLOCKED':
        return {
          title: 'Situs Memblokir Server (Cloudflare/Anti-Bot Block)',
          description: `Host "${report.host}" mendeteksi IP server dynamic scraper dan memblokir koneksi secara langsung.`,
          advice: 'Rekomendasi Solusi:',
          steps: [
            'Paksa pengguna untuk melakukan scan lewat Chrome Extension, bukan scan server langsung.',
            'Extension memanfaatkan IP residensial user asli sehingga 100% aman dari blokir bot Cloudflare.',
            'Pastikan file "chrome-extension/content.js" diaktifkan pada browser.'
          ]
        };
      case 'SKELETON_DETECTED':
        return {
          title: 'Halaman SPA / Skeleton Terdeteksi Kosong',
          description: 'Server mengambil halaman web dynamic sebelum React/Next.js merender detail lowongan di layar.',
          advice: 'Rekomendasi Solusi:',
          steps: [
            'Situs ini menggunakan rendering client-side dinamis.',
            'Naikkan batas buffer "slice(0, 35000)" di scraper backend untuk memastikan data streaming RSC Next.js ikut terbaca.',
            'Jika markup dimuat asinkron secara lambat, gunakan Extension dan klik tombol "Analyze" setelah halaman termuat penuh.'
          ]
        };
      case 'SELECTOR_MISSING':
        return {
          title: 'DOM Selector Gagal Mengekstrak Teks (Deskripsi Kosong)',
          description: `Sistem mencoba mengurai halaman "${report.host}" namun tidak menemukan kontainer deskripsi lowongan kerja.`,
          advice: 'Rekomendasi Solusi:',
          steps: [
            'Situs web kemungkinan telah mengubah struktur markup HTML atau class CSS-nya.',
            `Buka file "chrome-extension/content.js" (untuk ekstensi) atau "web/app/api/scrape-job/route.ts" (untuk server).`,
            `Tambahkan class kontainer baru dari DOM HTML Snippet di bawah ini ke dalam array kontainer deskripsi (descSelectors).`
          ]
        };
      case 'OPTIMIZATION_REQUEST':
        return {
          title: 'Permintaan Dukungan Optimasi Resmi Loker',
          description: `Pengguna meminta penambahan dukungan scraping resmi dan ter-optimasi untuk portal kustom "${report.host}".`,
          advice: 'Rekomendasi Tindakan:',
          steps: [
            'Buka URL lowongan pekerjaan yang diminta tersebut.',
            'Tinjau struktur HTML dan cari selector deskripsi, judul, dan nama perusahaan.',
            'Tambahkan pencocokan selector baru di file "chrome-extension/content.js" pada fungsi "extractJobDetails".',
            'Setelah selector ditambahkan, informasikan ke pengguna bahwa portal kustom ini kini telah didukung secara resmi!'
          ]
        };
      case 'NETWORK_ERROR':
      default:
        return {
          title: 'Kesalahan Jaringan / Koneksi Gagal',
          description: `Chrome Extension gagal berkomunikasi dengan tab browser aktif atau koneksi terputus.`,
          advice: 'Rekomendasi Solusi:',
          steps: [
            'Instruksikan pengguna untuk melakukan REFRESH (F5) pada tab lowongan kerja.',
            'Memastikan Chrome Extension di-reload/update jika script baru saja dimodifikasi.',
            'Periksa koneksi jaringan internet user.'
          ]
        };
    }
  };

  // Render error badge style
  const getErrorBadgeStyle = (type: string) => {
    switch (type) {
      case 'ANTI_BOT_BLOCKED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'SKELETON_DETECTED': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'SELECTOR_MISSING': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'OPTIMIZATION_REQUEST': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Get distinct hosts for filtering
  const distinctHosts = Array.from(new Set(reports.map(r => r.host)));
  const distinctTypes = Array.from(new Set(reports.map(r => r.failureType)));

  // Filter logs list
  let filteredReports = reports;
  if (selectedHostFilter) {
    filteredReports = filteredReports.filter(r => r.host === selectedHostFilter);
  }
  if (selectedTypeFilter) {
    filteredReports = filteredReports.filter(r => r.failureType === selectedTypeFilter);
  }

  // Calculate some aggregate diagnostics stats
  const serverCount = reports.filter(r => r.source === 'SERVER_SIDE').length;
  const extensionCount = reports.filter(r => r.source === 'CHROME_EXTENSION').length;
  const botBlockedCount = reports.filter(r => r.failureType === 'ANTI_BOT_BLOCKED').length;
  const missingSelectorCount = reports.filter(r => r.failureType === 'SELECTOR_MISSING').length;
  const optRequestCount = reports.filter(r => r.failureType === 'OPTIMIZATION_REQUEST').length;

  return (
    <div className="p-6 flex flex-col gap-6 w-full min-h-screen">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            Scraper Diagnostics & Self-Improving Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konsol pemantauan otomatis untuk menganalisis dan mendiagnosis kegagalan scraping secara real-time pada berbagai job portals.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button 
            onClick={fetchReports}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>

          {/* Clear Logs button */}
          {reports.length > 0 && (
            <button 
              onClick={handleClearLogs}
              disabled={clearing || loading}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear Diagnostics Logs
            </button>
          )}
        </div>
      </div>

      {/* EDUCATIONAL TIP: Explains what self-improving is for */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur flex flex-col md:flex-row gap-5 items-start justify-between">
        <div className="flex gap-4 items-start flex-1">
          <div className="bg-indigo-500/10 border border-indigo-500/15 p-3 rounded-2xl text-indigo-400 shrink-0 mt-0.5">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-200 mb-1 flex items-center gap-2">
              Bagaimana Sistem Ini Membantu Anda Ber-improvisasi?
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Ketika pengguna melakukan pemindaian loker dan mengalami kegagalan (misalnya karena terblokir Cloudflare atau kontainer teks kosong), sistem secara otomatis mencatat detail error beserta **struktur tag HTML luar (*outerHTML*)** kontainer tersebut ke SQLite. 
              Sebagai developer, Anda dapat langsung melihat strukturnya di bawah ini tanpa perlu membuka portal loker tersebut dan melakukan *Inspect Element* secara manual. Ini membuat Anda dapat memperbarui selector DOM pada ekstensi secara instan!
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards Grid */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Total Failure Logs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Kegagalan Log</div>
              <div className="text-3xl font-black text-slate-200 mt-1">{reports.length}</div>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400 border border-indigo-500/15">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Server-Side Failures */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gagal di Server-Side</div>
              <div className="text-3xl font-black text-rose-400 mt-1">{serverCount}</div>
            </div>
            <div className="bg-rose-500/10 p-3 rounded-xl text-rose-400 border border-rose-500/15">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          {/* Chrome Extension Failures */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gagal di Extension</div>
              <div className="text-3xl font-black text-amber-400 mt-1">{extensionCount}</div>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400 border border-amber-500/15">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          {/* Main Error Type */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {optRequestCount > 0 ? 'Permintaan Optimasi' : 'Masalah Utama'}
              </div>
              <div className="text-sm font-extrabold text-indigo-400 mt-2 line-clamp-1">
                {optRequestCount > 0 
                  ? `${optRequestCount} Portal Kustom` 
                  : (botBlockedCount > missingSelectorCount ? 'Cloudflare Block' : 'Selector DOM Berubah')}
              </div>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400 border border-indigo-500/15">
              {optRequestCount > 0 ? <HelpCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Content section */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-6 py-4 rounded-2xl flex items-center gap-2 max-w-xl mx-auto">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Error loading: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-indigo-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-850 rounded-3xl max-w-xl mx-auto w-full">
          <div className="bg-slate-950 p-4 rounded-full border border-slate-800 text-slate-500 inline-block mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400/80" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-300">Semua Scraper Sehat Walafiat!</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed px-6">
            Tidak ada laporan kegagalan scraping atau scanning yang masuk ke database. 
            Sistem bekerja dengan sehat dan parser selector DOM Anda berjalan dengan sempurna!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          
          {/* Filters row */}
          <div className="flex items-center gap-4 flex-wrap text-xs pb-3 border-b border-slate-900">
            {/* Host filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Filter by Host:
              </span>
              <select 
                value={selectedHostFilter || ''}
                onChange={(e) => setSelectedHostFilter(e.target.value || null)}
                className="bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-xs"
              >
                <option value="">All Domains</option>
                {distinctHosts.map(host => (
                  <option key={host} value={host}>{host}</option>
                ))}
              </select>
            </div>

            {/* Error Type filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Filter by Issue:
              </span>
              <select 
                value={selectedTypeFilter || ''}
                onChange={(e) => setSelectedTypeFilter(e.target.value || null)}
                className="bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-xs"
              >
                <option value="">All Error Types</option>
                {distinctTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE LOG LIST */}
          <div className="flex flex-col gap-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-10 border border-slate-850 rounded-2xl text-xs text-slate-500">
                Tidak ada log kesalahan yang cocok dengan filter.
              </div>
            ) : (
              filteredReports.map(report => {
                const isExpanded = expandedReportId === report.id;
                const remedy = getSmartRemedyAdvice(report);
                
                return (
                  <div 
                    key={report.id} 
                    onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                    className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col gap-4"
                  >
                    
                    {/* Header: domain, badge, and source */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-950 p-2 border border-slate-850 rounded-xl text-slate-400 group-hover:text-slate-200">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                            {report.host}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({report.platform || 'General Portal'})
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Dilaporkan pada {new Date(report.createdAt).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Badges and actions */}
                      <div className="flex items-center gap-2.5">
                        {/* Source badge */}
                        <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${
                          report.source === 'CHROME_EXTENSION' 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                          {report.source === 'CHROME_EXTENSION' ? (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              Extension
                            </>
                          ) : (
                            <>
                              <Cpu className="w-2.5 h-2.5" />
                              Server
                            </>
                          )}
                        </span>

                        {/* Error Type badge */}
                        <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 border rounded-full ${getErrorBadgeStyle(report.failureType)}`}>
                          {report.failureType.replace(/_/g, ' ')}
                        </span>
                        
                        <a 
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // prevent expand card
                          className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Open Failed URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Summary preview snippet when collapsed */}
                    {!isExpanded && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                        <strong className="text-rose-400">Error:</strong> {report.errorMessage}
                      </p>
                    )}

                    {/* EXPANDABLE SMART REMEDY & DOM SNIPPET VIEW */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-850/80 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-255">
                        
                        {/* Main Error Message Details */}
                        <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl text-xs">
                          <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 block mb-1">Pesan Error Lengkap</span>
                          <p className="text-slate-300 leading-relaxed font-mono">{report.errorMessage}</p>
                        </div>

                        {/* Grid: Smart Remedy Box & DOM Snippet */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Smart Remedy Box */}
                          <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                              Developer Smart Remedy
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-200 mt-1">{remedy.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{remedy.description}</p>
                            
                            <div className="border-t border-slate-800/40 pt-2 mt-1">
                              <div className="text-[10px] font-bold text-slate-400 mb-1">{remedy.advice}</div>
                              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300 leading-relaxed">
                                {remedy.steps.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* DOM Snippet Container */}
                          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 flex items-center gap-1">
                              <FileCode className="w-3.5 h-3.5" />
                              HTML DOM Snippet / Selector Path
                            </span>
                            {report.htmlSnippet ? (
                              <div className="flex-1 overflow-auto max-h-[160px] text-[10px] font-mono text-slate-400 leading-normal p-2.5 bg-slate-900 border border-slate-800 rounded-lg whitespace-pre-wrap">
                                {report.htmlSnippet}
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center justify-center text-[11px] text-slate-600 italic py-8">
                                Tidak ada potongan HTML yang terekam untuk tipe kesalahan ini.
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
