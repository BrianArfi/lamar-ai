/**
 * Career-Ops Chrome Extension Popup Controller
 * Manages Sync Token Settings, Job Page Scraping, Form Field Detection, and AI Form Auto-filling.
 */

// UI Element Mappings
const settingsPanel = document.getElementById('settingsPanel');
const toggleSettings = document.getElementById('toggleSettings');
const syncTokenInput = document.getElementById('syncToken');
const baseUrlInput = document.getElementById('baseUrl');
const btnSaveSettings = document.getElementById('btnSaveSettings');

const tabScrape = document.getElementById('tabScrape');
const tabAutofill = document.getElementById('tabAutofill');
const scrapeTabContent = document.getElementById('scrapeTabContent');
const autofillTabContent = document.getElementById('autofillTabContent');

// Scrape Elements
const lblTitle = document.getElementById('lblTitle');
const lblCompany = document.getElementById('lblCompany');
const lblDescPreview = document.getElementById('lblDescPreview');
const btnScrapeAndTrack = document.getElementById('btnScrapeAndTrack');
const customPortalCard = document.getElementById('customPortalCard');

// Autofill Elements
const cvSelect = document.getElementById('cvSelect');
const btnDetectFields = document.getElementById('btnDetectFields');
const fieldsListContainer = document.getElementById('fieldsListContainer');
const btnAutofill = document.getElementById('btnAutofill');

const statusMsg = document.getElementById('statusMsg');

let scrapedJobData = null;
let detectedFields = [];
let savedSyncToken = '';
let savedBaseUrl = 'http://localhost:3000';

// Initialize Popup
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load configuration settings
  chrome.storage.sync.get(['syncToken', 'baseUrl'], (items) => {
    if (items.syncToken) {
      savedSyncToken = items.syncToken;
      syncTokenInput.value = savedSyncToken;
    }
    if (items.baseUrl) {
      savedBaseUrl = items.baseUrl;
      baseUrlInput.value = savedBaseUrl;
    }

    updateStatusText();

    // 2. Fetch CVs if token is available
    if (savedSyncToken) {
      fetchUserResumes();
    }
  });

  // 3. Setup settings panel toggle
  toggleSettings.addEventListener('click', () => {
    if (settingsPanel.style.display === 'block') {
      settingsPanel.style.display = 'none';
    } else {
      settingsPanel.style.display = 'block';
    }
  });

  // 4. Save settings
  btnSaveSettings.addEventListener('click', () => {
    const token = syncTokenInput.value.trim();
    const url = baseUrlInput.value.trim().replace(/\/$/, ''); // strip trailing slash

    chrome.storage.sync.set({ syncToken: token, baseUrl: url }, () => {
      savedSyncToken = token;
      savedBaseUrl = url;
      settingsPanel.style.display = 'none';
      toastMsg('Settings saved successfully!', 'success');
      updateStatusText();
      
      if (savedSyncToken) {
        fetchUserResumes();
      }
    });
  });

  // 5. Tabs Toggle Logic
  tabScrape.addEventListener('click', () => {
    tabScrape.classList.add('active');
    tabAutofill.classList.remove('active');
    scrapeTabContent.style.display = 'block';
    autofillTabContent.style.display = 'none';
  });

  tabAutofill.addEventListener('click', () => {
    tabAutofill.classList.add('active');
    tabScrape.classList.remove('active');
    autofillTabContent.style.display = 'block';
    scrapeTabContent.style.display = 'none';
  });

  // 6. Scan/Scrape Active Tab Job Details
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.url) {
      lblTitle.innerText = "No Active Tab";
      lblCompany.innerText = "Open a job portal to scrape listings.";
      return;
    }

    const url = activeTab.url;
    // Show/hide helper card for general pages
    const isStandardPortal = url.includes('linkedin.com') ||
                             url.includes('glints.com') ||
                             url.includes('kalibrr.com') ||
                             url.includes('jobstreet.co.id') ||
                             url.includes('jobstreet.com') ||
                             url.includes('indeed.com') ||
                             url.includes('indeed.co.id') ||
                             url.includes('techinasia.com') ||
                             url.includes('greenhouse.io') ||
                             url.includes('lever.co') ||
                             url.includes('workday.com');

    if (!isStandardPortal) {
      customPortalCard.style.display = 'block';
    } else {
      customPortalCard.style.display = 'none';
    }

    lblTitle.innerText = "Scanning page elements...";
    lblCompany.innerText = "Reading DOM details...";

    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        console.warn("Direct messaging content script failed, retrying page inject...", chrome.runtime.lastError);
        lblTitle.innerText = "Page connection pending";
        lblCompany.innerText = "Please refresh the page to load co-pilot listeners.";
        toastMsg("Refeshing the job page may be required to enable scanning.", "warning");
      } else {
        scrapedJobData = response.data;
        lblTitle.innerText = scrapedJobData.title || "Job Listing Scanned";
        lblCompany.innerText = scrapedJobData.company || "Company Unknown";
        
        let desc = scrapedJobData.description || '';
        if (desc.length > 150) {
          desc = desc.substring(0, 150) + '...';
        }
        lblDescPreview.innerText = desc || "No description text identified.";
        btnScrapeAndTrack.disabled = false;
      }
    });
  });

  // 7. Redirect Scraped Job details to SaaS CV Studio
  btnScrapeAndTrack.addEventListener('click', () => {
    if (!scrapedJobData) return;
    
    const params = new URLSearchParams({
      url: scrapedJobData.url || '',
      title: scrapedJobData.title || '',
      company: scrapedJobData.company || '',
      description: scrapedJobData.description || ''
    });

    const redirectUrl = `${savedBaseUrl}/dashboard/cv?${params.toString()}`;
    chrome.tabs.create({ url: redirectUrl });
  });

  // 8. Detect Form Fields Client-side
  btnDetectFields.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) return;

      toastMsg("Scanning form inputs...", "info");
      chrome.tabs.sendMessage(activeTab.id, { action: 'detectFields' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          toastMsg("Failed to scan page. Ensure you are on a form page and refresh.", "danger");
        } else {
          detectedFields = response.fields || [];
          if (detectedFields.length === 0) {
            toastMsg("No input fields identified on this page.", "warning");
            fieldsListContainer.style.display = 'none';
            btnAutofill.disabled = true;
          } else {
            toastMsg(`Identified ${detectedFields.length} input field(s).`, "success");
            fieldsListContainer.style.display = 'block';
            fieldsListContainer.innerHTML = detectedFields.map(field => `
              <div class="field-item">
                <span class="field-label">${field.label}</span>
                <span class="field-type">${field.type}</span>
              </div>
            `).join('');
            btnAutofill.disabled = false;
          }
        }
      });
    });
  });

  // 9. Call Auto-filler Endpoint and Write values
  btnAutofill.addEventListener('click', async () => {
    if (!savedSyncToken) {
      toastMsg("Please save your Sync Token key in co-pilot settings first.", "danger");
      return;
    }
    if (detectedFields.length === 0) {
      toastMsg("Detect fields on the active form page first.", "warning");
      return;
    }

    const selectedCv = cvSelect.value;
    if (!selectedCv) {
      toastMsg("Please select a profile resume from the list.", "warning");
      return;
    }

    btnAutofill.disabled = true;
    btnAutofill.innerText = "🤖 Writing tailored answers...";
    toastMsg("Co-pilot is analyzing and drafting values...", "info");

    try {
      const fillRes = await fetch(`${savedBaseUrl}/api/autofill-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedSyncToken}`
        },
        body: JSON.stringify({
          fields: detectedFields,
          cvId: selectedCv
        })
      });

      const json = await fillRes.json();
      if (!json.success) {
        throw new Error(json.error || "Form filler service failed.");
      }

      // Send mapping coordinates back to content script to fill the form in user viewport
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'fillFields', data: json.data }, (response) => {
          btnAutofill.disabled = false;
          btnAutofill.innerText = "🤖 Auto-fill Application";

          if (chrome.runtime.lastError || !response || !response.success) {
            toastMsg("Failed to write values back to inputs.", "danger");
          } else {
            const count = response.result ? response.result.filledCount : 0;
            toastMsg(`Success! Populated ${count} form input field(s). 🎉`, "success");
          }
        });
      });

    } catch (err) {
      btnAutofill.disabled = false;
      btnAutofill.innerText = "🤖 Auto-fill Application";
      toastMsg(err.message || "Failed to auto-fill form.", "danger");
    }
  });
});

// Helper: Fetch user's master and tailored CV options from backend
async function fetchUserResumes() {
  cvSelect.innerHTML = `<option value="">-- Fetching resumes from account... --</option>`;
  try {
    const res = await fetch(`${savedBaseUrl}/api/resumes?list=true`, {
      headers: {
        'Authorization': `Bearer ${savedSyncToken}`
      }
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to fetch resumes.");
    }

    const list = json.list || [];
    if (list.length === 0) {
      cvSelect.innerHTML = `<option value="">No CVs identified on your Career-Ops dashboard.</option>`;
    } else {
      cvSelect.innerHTML = list.map(item => `
        <option value="${item.id}">${item.name}</option>
      `).join('');
    }
  } catch (err) {
    console.error("Resume load failed:", err);
    cvSelect.innerHTML = `<option value="">Error connecting to co-pilot. Check URL & Token.</option>`;
    toastMsg("Failed to fetch resume options from SaaS backend.", "danger");
  }
}

// Helper: Update status co-pilot connection indicator text
function updateStatusText() {
  if (!savedSyncToken) {
    statusMsg.innerText = "Settings incomplete. Paste Sync Token in settings to link dashboard.";
    statusMsg.className = "status-msg error-msg";
  } else {
    statusMsg.innerText = `Connected successfully with SaaS co-pilot.`;
    statusMsg.className = "status-msg";
  }
}

// Helper: Show transient popup toast notices
function toastMsg(msg, type = 'info') {
  statusMsg.innerText = msg;
  if (type === 'danger') {
    statusMsg.className = "status-msg error-msg";
  } else if (type === 'success') {
    statusMsg.className = "status-msg";
    statusMsg.style.color = "#10b981"; // Success green
  } else if (type === 'warning') {
    statusMsg.className = "status-msg";
    statusMsg.style.color = "#f59e0b"; // Warning orange
  } else {
    statusMsg.className = "status-msg";
    statusMsg.style.color = ""; // Muted fallback
  }
}
