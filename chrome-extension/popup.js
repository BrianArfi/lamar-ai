/**
 * Career-Ops Chrome Extension Popup Controller
 * Manages Sync Token Settings, Job Page Scraping, Form Field Detection, and AI Form Auto-filling.
 *
 * Configuration is resolved in three layers (highest priority wins):
 *   1. Values the user saved in the popup settings (chrome.storage.sync)
 *   2. Remote config JSON fetched from `remoteConfigUrl`, if one is set
 *   3. Packaged defaults shipped in config.json
 *
 * Empty settings fields fall back to the layer below, so a fresh install
 * works against config.json with zero typing. To point a whole team at one
 * backend, host a JSON file ({"baseUrl": "...", "knownPortals": [...]}) and
 * set its URL as the Remote Config URL once.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PACKAGED_DEFAULTS = {
  baseUrl: 'http://localhost:3000',
  remoteConfigUrl: '',
  // Hosts with dedicated scraper parsers in content.js. Anything else gets the
  // "Universal Mode" density-scanner banner.
  knownPortals: [
    'linkedin.com', 'indeed.com', 'indeed.co.id', 'glints.com',
    'jobstreet.co.id', 'jobstreet.com', 'kalibrr.com', 'greenhouse.io',
    'lever.co', 'techinasia.com', 'workday.com', 'myworkdayjobs.com'
  ]
};

// Keys a remote config file is allowed to override. `remoteConfigUrl` is
// deliberately excluded so a remote file can't redirect future config fetches.
const REMOTE_CONFIG_KEYS = ['baseUrl', 'knownPortals'];

const FETCH_TIMEOUT_MS = 8000;

let config = { ...PACKAGED_DEFAULTS }; // packaged defaults + remote overrides
let userSettings = { syncToken: '', baseUrl: '', remoteConfigUrl: '' };

let scrapedJobData = null;
let detectedFields = [];

// ---------------------------------------------------------------------------
// UI Element Mappings
// ---------------------------------------------------------------------------

const ui = {
  settingsPanel: document.getElementById('settingsPanel'),
  toggleSettings: document.getElementById('toggleSettings'),
  syncToken: document.getElementById('syncToken'),
  baseUrl: document.getElementById('baseUrl'),
  remoteConfigUrl: document.getElementById('remoteConfigUrl'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  btnTestConnection: document.getElementById('btnTestConnection'),
  btnOpenDashboard: document.getElementById('btnOpenDashboard'),

  tabScrape: document.getElementById('tabScrape'),
  tabAutofill: document.getElementById('tabAutofill'),
  scrapeTabContent: document.getElementById('scrapeTabContent'),
  autofillTabContent: document.getElementById('autofillTabContent'),

  lblTitle: document.getElementById('lblTitle'),
  lblCompany: document.getElementById('lblCompany'),
  lblDescPreview: document.getElementById('lblDescPreview'),
  btnScrapeAndTrack: document.getElementById('btnScrapeAndTrack'),
  customPortalCard: document.getElementById('customPortalCard'),

  cvSelect: document.getElementById('cvSelect'),
  btnDetectFields: document.getElementById('btnDetectFields'),
  fieldsListContainer: document.getElementById('fieldsListContainer'),
  btnAutofill: document.getElementById('btnAutofill'),

  statusMsg: document.getElementById('statusMsg')
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  wireEvents();

  await loadPackagedConfig();
  await loadUserSettings();
  populateSettingsForm();
  await applyRemoteConfig();

  updateConnectionStatus();
  if (userSettings.syncToken) {
    fetchUserResumes();
  }
  scanActiveTab();
});

function wireEvents() {
  ui.toggleSettings.addEventListener('click', () => {
    const open = ui.settingsPanel.style.display === 'block';
    ui.settingsPanel.style.display = open ? 'none' : 'block';
  });

  ui.btnSaveSettings.addEventListener('click', saveSettings);
  ui.btnTestConnection.addEventListener('click', testConnection);
  ui.btnOpenDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: `${activeBaseUrl()}/dashboard` });
  });

  ui.tabScrape.addEventListener('click', () => switchTab('scrape'));
  ui.tabAutofill.addEventListener('click', () => switchTab('autofill'));

  ui.btnScrapeAndTrack.addEventListener('click', openInCvStudio);
  ui.btnDetectFields.addEventListener('click', detectFields);
  ui.btnAutofill.addEventListener('click', autofillForm);
}

function switchTab(tab) {
  const scrape = tab === 'scrape';
  ui.tabScrape.classList.toggle('active', scrape);
  ui.tabAutofill.classList.toggle('active', !scrape);
  ui.scrapeTabContent.style.display = scrape ? 'block' : 'none';
  ui.autofillTabContent.style.display = scrape ? 'none' : 'block';
}

// ---------------------------------------------------------------------------
// Configuration loading (config.json -> storage -> remote config)
// ---------------------------------------------------------------------------

async function loadPackagedConfig() {
  try {
    const res = await fetch(chrome.runtime.getURL('config.json'));
    if (!res.ok) return;
    mergeConfig(await res.json(), [...REMOTE_CONFIG_KEYS, 'remoteConfigUrl']);
  } catch (err) {
    console.warn('config.json missing or invalid — using built-in defaults.', err);
  }
}

async function loadUserSettings() {
  const items = await chrome.storage.sync.get(['syncToken', 'baseUrl', 'remoteConfigUrl']);
  userSettings = {
    syncToken: items.syncToken || '',
    baseUrl: items.baseUrl || '',
    remoteConfigUrl: items.remoteConfigUrl || ''
  };
}

async function applyRemoteConfig() {
  const url = (userSettings.remoteConfigUrl || config.remoteConfigUrl || '').trim();
  if (!url) return;
  try {
    const res = await fetchWithTimeout(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || typeof json !== 'object') throw new Error('Remote config is not a JSON object');
    mergeConfig(json, REMOTE_CONFIG_KEYS);
    populateSettingsForm(); // refresh placeholders with remote defaults
  } catch (err) {
    console.warn('Remote config fetch failed — continuing with local settings.', err);
    setStatus('Remote config unavailable — using local settings.', 'warning');
  }
}

function mergeConfig(source, allowedKeys) {
  if (!source || typeof source !== 'object') return;
  for (const key of allowedKeys) {
    const value = source[key];
    if (key === 'knownPortals') {
      if (Array.isArray(value)) {
        const hosts = value
          .filter((v) => typeof v === 'string' && v.trim())
          .map((v) => v.trim().toLowerCase());
        if (hosts.length > 0) config.knownPortals = hosts;
      }
    } else if (typeof value === 'string' && value.trim()) {
      config[key] = key === 'baseUrl' ? value.trim().replace(/\/+$/, '') : value.trim();
    }
  }
}

/** Effective base URL: explicit user setting wins over remote/packaged config. */
function activeBaseUrl() {
  return userSettings.baseUrl || config.baseUrl;
}

function populateSettingsForm() {
  ui.syncToken.value = userSettings.syncToken;
  ui.baseUrl.value = userSettings.baseUrl;
  ui.remoteConfigUrl.value = userSettings.remoteConfigUrl;
  // Show the value the layer below would supply, so leaving a field empty is safe.
  ui.baseUrl.placeholder = config.baseUrl;
  ui.remoteConfigUrl.placeholder = config.remoteConfigUrl || 'https://example.com/career-ops-config.json';
}

// ---------------------------------------------------------------------------
// Settings actions
// ---------------------------------------------------------------------------

async function saveSettings() {
  const token = ui.syncToken.value.trim();
  const baseUrl = normalizeUrl(ui.baseUrl.value);
  const remoteConfigUrl = normalizeUrl(ui.remoteConfigUrl.value);

  if (baseUrl === null) {
    setStatus('Base URL is not a valid URL — example: https://my-app.vercel.app', 'error');
    return;
  }
  if (remoteConfigUrl === null) {
    setStatus('Remote Config URL is not a valid URL.', 'error');
    return;
  }

  // Ask Chrome for access to these origins so API calls aren't blocked by CORS.
  await requestHostAccess([baseUrl || config.baseUrl, remoteConfigUrl].filter(Boolean));

  userSettings = { syncToken: token, baseUrl, remoteConfigUrl };
  await chrome.storage.sync.set(userSettings);

  ui.settingsPanel.style.display = 'none';
  setStatus('Settings saved.', 'success');

  await applyRemoteConfig();
  updateConnectionStatus();
  if (userSettings.syncToken) {
    fetchUserResumes();
  }
}

async function testConnection() {
  const token = ui.syncToken.value.trim() || userSettings.syncToken;
  const rawBase = ui.baseUrl.value.trim();
  const base = rawBase ? normalizeUrl(rawBase) : activeBaseUrl();
  if (base === null) {
    setStatus('Base URL is not a valid URL — example: https://my-app.vercel.app', 'error');
    return;
  }

  await requestHostAccess([base]);
  setStatus(`Testing connection to ${base}…`, 'info');

  try {
    const res = await fetchWithTimeout(`${base}/api/resumes?list=true`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.status === 401 || res.status === 403) {
      setStatus('Server reached, but the Sync Token was rejected. Generate a fresh token in your dashboard.', 'error');
      return;
    }
    if (!res.ok) {
      setStatus(`Server reached, but it returned HTTP ${res.status}. Check that this is your Career-Ops backend.`, 'warning');
      return;
    }
    const json = await res.json().catch(() => null);
    const count = json && Array.isArray(json.list) ? json.list.length : null;
    setStatus(count === null ? 'Connection OK.' : `Connection OK — ${count} resume(s) available.`, 'success');
  } catch (err) {
    setStatus(describeFetchError(err), 'error');
  }
}

/**
 * Normalize a URL string: trims, strips trailing slashes, and assumes https://
 * when no scheme is given. Returns '' for empty input, null for invalid input.
 */
function normalizeUrl(raw) {
  let value = (raw || '').trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) {
    // Bare hostnames get https://, except loopback hosts which are usually http dev servers.
    const scheme = /^(localhost|127\.0\.0\.1)([:/]|$)/i.test(value) ? 'http' : 'https';
    value = `${scheme}://${value}`;
  }
  try {
    return new URL(value).toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/** Request optional host permission for the given URLs' origins (best effort). */
async function requestHostAccess(urls) {
  const origins = [];
  for (const u of urls) {
    try {
      const { origin } = new URL(u);
      if (origin && origin !== 'null') origins.push(`${origin}/*`);
    } catch { /* not a URL — skip */ }
  }
  if (origins.length === 0 || !chrome.permissions) return;
  try {
    await chrome.permissions.request({ origins });
  } catch (err) {
    // Denied or not user-initiated — requests may still work if the server allows CORS.
    console.warn('Host permission request skipped:', err);
  }
}

// ---------------------------------------------------------------------------
// Scrape tab
// ---------------------------------------------------------------------------

async function scanActiveTab() {
  const tab = await getActiveTab();
  if (!tab || !tab.url) {
    ui.lblTitle.textContent = 'No Active Tab';
    ui.lblCompany.textContent = 'Open a job portal to scrape listings.';
    return;
  }

  if (isRestrictedUrl(tab.url)) {
    ui.lblTitle.textContent = "This page can't be scanned";
    ui.lblCompany.textContent = 'Browser system pages and the Web Store are off-limits to extensions. Open a job listing instead.';
    return;
  }

  const isKnownPortal = config.knownPortals.some((host) => tab.url.includes(host));
  ui.customPortalCard.style.display = isKnownPortal ? 'none' : 'block';

  ui.lblTitle.textContent = 'Scanning page elements...';
  ui.lblCompany.textContent = 'Reading job details from the open tab...';

  try {
    const response = await sendToTab(tab.id, { action: 'scrapeJob' });
    if (!response.success) throw new Error(response.error || 'Page scan failed.');

    scrapedJobData = response.data;
    ui.lblTitle.textContent = scrapedJobData.title || 'Job Listing Scanned';
    ui.lblCompany.textContent = scrapedJobData.company || 'Company Unknown';

    let desc = scrapedJobData.description || '';
    if (desc.length > 150) {
      desc = desc.substring(0, 150) + '...';
    }
    ui.lblDescPreview.textContent = desc || 'No description text identified.';
    ui.btnScrapeAndTrack.disabled = false;
  } catch (err) {
    console.warn('Content script not reachable on this tab:', err);
    ui.lblTitle.textContent = 'Page not connected yet';
    ui.lblCompany.textContent = 'Refresh the job page, then reopen this popup.';
    setStatus('Tip: after installing or updating the extension, open pages need one refresh to load the co-pilot.', 'warning');
  }
}

function openInCvStudio() {
  if (!scrapedJobData) return;

  const params = new URLSearchParams({
    url: scrapedJobData.url || '',
    title: scrapedJobData.title || '',
    company: scrapedJobData.company || '',
    description: scrapedJobData.description || ''
  });

  chrome.tabs.create({ url: `${activeBaseUrl()}/dashboard/cv?${params.toString()}` });
}

// ---------------------------------------------------------------------------
// Auto-fill tab
// ---------------------------------------------------------------------------

async function detectFields() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    setStatus('No active tab found.', 'error');
    return;
  }

  setStatus('Scanning form inputs…', 'info');
  try {
    const response = await sendToTab(tab.id, { action: 'detectFields' });
    if (!response.success) throw new Error(response.error || 'Field scan failed.');

    detectedFields = response.fields || [];
    if (detectedFields.length === 0) {
      setStatus('No fillable input fields found on this page.', 'warning');
      ui.fieldsListContainer.style.display = 'none';
      ui.btnAutofill.disabled = true;
      return;
    }

    renderFieldsList(detectedFields);
    ui.fieldsListContainer.style.display = 'block';
    ui.btnAutofill.disabled = false;
    setStatus(`Identified ${detectedFields.length} input field(s).`, 'success');
  } catch (err) {
    console.warn('Field detection failed:', err);
    setStatus('Could not scan this page. Refresh the form page and try again.', 'error');
  }
}

function renderFieldsList(fields) {
  ui.fieldsListContainer.innerHTML = '';
  for (const field of fields) {
    const item = document.createElement('div');
    item.className = 'field-item';

    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = field.label;

    const type = document.createElement('span');
    type.className = 'field-type';
    type.textContent = field.type;

    item.append(label, type);
    ui.fieldsListContainer.appendChild(item);
  }
}

async function autofillForm() {
  if (!userSettings.syncToken) {
    setStatus('Save your Sync Token in settings (gear icon) first.', 'error');
    return;
  }
  if (detectedFields.length === 0) {
    setStatus('Scan the form fields on the active page first.', 'warning');
    return;
  }
  const selectedCv = ui.cvSelect.value;
  if (!selectedCv) {
    setStatus('Select a profile resume from the list first.', 'warning');
    return;
  }

  ui.btnAutofill.disabled = true;
  ui.btnAutofill.textContent = '🤖 Writing tailored answers...';
  setStatus('Co-pilot is analyzing fields and drafting values…', 'info');

  try {
    const fillRes = await apiFetch('/api/autofill-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: detectedFields, cvId: selectedCv })
    });

    if (fillRes.status === 401 || fillRes.status === 403) {
      throw new Error('Sync Token was rejected — generate a fresh one in your dashboard settings.');
    }
    if (!fillRes.ok) {
      throw new Error(`Auto-fill service error (HTTP ${fillRes.status}). Try again in a moment.`);
    }

    const json = await fillRes.json();
    if (!json.success) {
      throw new Error(json.error || 'Form filler service failed.');
    }

    // Send mapped values back to the content script to fill the form in the page.
    const tab = await getActiveTab();
    const response = await sendToTab(tab.id, { action: 'fillFields', data: json.data });
    if (!response.success) {
      throw new Error('Drafted answers, but could not write them into the page inputs. Refresh and rescan.');
    }

    const count = response.result ? response.result.filledCount : 0;
    setStatus(`Filled ${count} field(s). Review every answer before submitting. 🎉`, 'success');
  } catch (err) {
    setStatus(isNetworkError(err) ? describeFetchError(err) : err.message, 'error');
  } finally {
    ui.btnAutofill.disabled = false;
    ui.btnAutofill.textContent = '🤖 Auto-fill Application';
  }
}

async function fetchUserResumes() {
  setSelectPlaceholder('-- Fetching resumes from account... --');
  try {
    const res = await apiFetch('/api/resumes?list=true');
    if (res.status === 401 || res.status === 403) {
      throw new Error('Sync Token was rejected. Generate a fresh one in your dashboard settings.');
    }
    if (!res.ok) {
      throw new Error(`Server error (HTTP ${res.status}) while loading resumes.`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch resumes.');
    }

    const list = Array.isArray(json.list) ? json.list : [];
    if (list.length === 0) {
      setSelectPlaceholder('No CVs found — create one in your dashboard first.');
      return;
    }

    ui.cvSelect.innerHTML = '';
    for (const item of list) {
      const opt = document.createElement('option');
      opt.value = String(item.id);
      opt.textContent = item.name || `CV ${item.id}`;
      ui.cvSelect.appendChild(opt);
    }
  } catch (err) {
    console.error('Resume load failed:', err);
    setSelectPlaceholder('Could not load CVs — check Base URL & Token.');
    setStatus(isNetworkError(err) ? describeFetchError(err) : err.message, 'error');
  }
}

function setSelectPlaceholder(text) {
  ui.cvSelect.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.textContent = text;
  ui.cvSelect.appendChild(opt);
}

// ---------------------------------------------------------------------------
// Networking helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch against the active backend with the Sync Token attached. */
function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (userSettings.syncToken) {
    headers['Authorization'] = `Bearer ${userSettings.syncToken}`;
  }
  return fetchWithTimeout(`${activeBaseUrl()}${path}`, { ...options, headers });
}

function isNetworkError(err) {
  return err instanceof TypeError || err.name === 'AbortError';
}

function describeFetchError(err) {
  if (err && err.name === 'AbortError') {
    return `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s. Is the server at ${activeBaseUrl()} running?`;
  }
  return `Could not reach ${activeBaseUrl()}. Check the Base URL in settings, make sure the backend is running, and that the extension has access (Save Settings grants it).`;
}

// ---------------------------------------------------------------------------
// Tab + status helpers
// ---------------------------------------------------------------------------

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function sendToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response) {
        reject(new Error('No response from the page script.'));
      } else {
        resolve(response);
      }
    });
  });
}

function isRestrictedUrl(url) {
  return /^(chrome|edge|brave|about|chrome-extension|devtools):/i.test(url) ||
         url.startsWith('https://chromewebstore.google.com');
}

function updateConnectionStatus() {
  if (!userSettings.syncToken) {
    setStatus('Not linked yet — open settings (⚙) and paste your Sync Token from the dashboard.', 'error');
  } else {
    setStatus(`Linked to ${activeBaseUrl()}. Open a job listing to begin.`, 'info');
  }
}

function setStatus(message, type = 'info') {
  ui.statusMsg.textContent = message;
  const variants = { success: 'success', warning: 'warning', error: 'error', danger: 'error' };
  ui.statusMsg.className = variants[type] ? `status-msg ${variants[type]}` : 'status-msg';
}
