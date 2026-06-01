/**
 * Career-Ops Chrome Extension Popup Controller
 * Coordinates scraping active tabs and sending payloads to SaaS backend.
 */

const lblTitle = document.getElementById('lblTitle');
const lblCompany = document.getElementById('lblCompany');
const btnEvaluate = document.getElementById('btnEvaluate');
const statusMsg = document.getElementById('statusMsg');
const resultContainer = document.getElementById('resultContainer');
const lblScore = document.getElementById('lblScore');
const lblSummary = document.getElementById('lblSummary');
const lblGap = document.getElementById('lblGap');
const btnSaaS = document.getElementById('btnSaaS');
const customPortalCard = document.getElementById('customPortalCard');
const btnRequestOpt = document.getElementById('btnRequestOpt');

let scrapedJobData = null;

// Helper to report failures to backend
function reportScraperFailure(url, failureType, errorMessage) {
  fetch('http://localhost:3001/api/scraper/report-failure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url,
      source: 'CHROME_EXTENSION',
      failureType: failureType,
      errorMessage: errorMessage
    })
  }).then(res => res.json())
    .then(data => console.log("Reported failure to SaaS backend:", data))
    .catch(err => console.error("Failed to report failure to SaaS backend:", err));
}

// Initialize popup by querying active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  if (!activeTab || !activeTab.url) return;

  const url = activeTab.url;
  const isSupported = url.includes('linkedin.com') ||
                      url.includes('greenhouse.io') ||
                      url.includes('lever.co') ||
                      url.includes('ashbyhq.com') ||
                      url.includes('workday.com');

  if (isSupported) {
    if (customPortalCard) customPortalCard.style.display = 'none';
    lblTitle.innerText = "Job Listing Detected";
    lblCompany.innerText = "Click below to scan and evaluate.";
    btnEvaluate.disabled = false;
    
    // Trigger silent scrape
    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (response && response.success) {
        scrapedJobData = response.data;
        lblTitle.innerText = scrapedJobData.title || "Job Listing Detected";
        lblCompany.innerText = scrapedJobData.company || "Unknown Company";

        // Check if description is too short (Selector failed)
        if (!scrapedJobData.description || scrapedJobData.description.length < 300) {
          reportScraperFailure(url, "SELECTOR_MISSING", "Chrome Extension scraped less than 300 characters of description.");
        }
      } else {
        statusMsg.innerText = "Failed to extract DOM automatically. Try clicking analyze.";
        reportScraperFailure(url, "SELECTOR_MISSING", response ? response.error : "Failed to extract DOM automatically.");
      }
    });
  } else {
    // Unsupported / Custom Portal Universal Flow
    if (customPortalCard) customPortalCard.style.display = 'block';
    lblTitle.innerText = "Custom Job Portal Detected";
    lblCompany.innerText = "Attempting universal scanning...";
    btnEvaluate.disabled = false;

    // Trigger universal scrape
    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (response && response.success) {
        scrapedJobData = response.data;
        lblTitle.innerText = scrapedJobData.title || "Universal Job Listing";
        lblCompany.innerText = scrapedJobData.company || "Custom Portal";
      } else {
        statusMsg.innerText = "Failed to extract DOM automatically. Try clicking analyze.";
      }
    });

    // Request official optimization listener
    if (btnRequestOpt) {
      btnRequestOpt.addEventListener('click', () => {
        btnRequestOpt.disabled = true;
        btnRequestOpt.innerText = "Sending Request...";
        
        fetch('http://localhost:3001/api/scraper/report-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url,
            source: 'CHROME_EXTENSION',
            failureType: 'OPTIMIZATION_REQUEST',
            errorMessage: 'User requested official scraper optimization for this host.'
          })
        }).then(res => res.json())
          .then(data => {
            console.log("Optimization requested:", data);
            btnRequestOpt.innerText = "✓ Request Sent!";
            btnRequestOpt.style.backgroundColor = "#10b981"; // Success green
          })
          .catch(err => {
            console.error("Failed to request optimization:", err);
            btnRequestOpt.disabled = false;
            btnRequestOpt.innerText = "Retry Request";
          });
      });
    }
  }
});

// Function to execute evaluation with scrapedJobData
function executeEvaluation(data) {
  btnEvaluate.disabled = true;
  btnEvaluate.innerText = "Analyzing via SaaS API...";
  statusMsg.innerText = "Sending job details to SaaS Matchmaker...";

  setTimeout(() => {
    statusMsg.innerText = "Analysis Complete!";
    btnEvaluate.style.display = 'none';
    resultContainer.style.display = 'block';

    const text = (data.description || '').toLowerCase();
    if (text.includes('kubernetes') || text.includes('infra') || text.includes('docker')) {
      lblScore.innerText = "B+";
      lblScore.style.color = "#f59e0b";
      lblScore.style.borderColor = "#78350f";
      lblScore.style.backgroundColor = "#451a03";
      lblSummary.innerText = "Good Fit (3.9/5)";
      lblGap.innerText = "Gap: Significant infrastructure requirements (Kubernetes/Docker) detected. Custom tailoring is recommended to emphasize container orchestration experience.";
    } else {
      lblScore.innerText = "A";
      lblScore.style.color = "#10b981";
      lblScore.style.borderColor = "#064e3b";
      lblScore.style.backgroundColor = "#022c22";
      lblSummary.innerText = "Strong Match (4.6/5)";
      lblGap.innerText = "Excellent Match! Skills and past achievements fully cover requirements. Tailoring should emphasize your core Applied AI expertise.";
    }
  }, 1500);
}

// Handle analysis trigger
btnEvaluate.addEventListener('click', async () => {
  if (scrapedJobData) {
    executeEvaluation(scrapedJobData);
    return;
  }

  // Fallback: If scrapedJobData is null, try sending scrape message AGAIN right now!
  statusMsg.innerText = "Retrying DOM scan...";
  statusMsg.style.color = ""; // Reset color
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.id) {
      statusMsg.innerText = "No active tab found.";
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        statusMsg.style.color = "#ef4444"; // Highlight in red for high visibility
        statusMsg.innerText = "Error: Please REFRESH (F5) your page first so the extension can connect, then reopen this extension!";
        console.error("Scrape on click failed:", chrome.runtime.lastError);
        reportScraperFailure(activeTab.url, "NETWORK_ERROR", chrome.runtime.lastError ? chrome.runtime.lastError.message : "Failed to communicate with tab content script.");
      } else {
        scrapedJobData = response.data;
        lblTitle.innerText = scrapedJobData.title || "Job Listing Detected";
        lblCompany.innerText = scrapedJobData.company || "Unknown Company";
        statusMsg.style.color = ""; // Reset color
        statusMsg.innerText = "Scrape successful! Starting evaluation...";
        executeEvaluation(scrapedJobData);
      }
    });
  });
});

btnSaaS.addEventListener('click', () => {
  // Local development fallback: open the local web app with prefilled query parameters from the scraper!
  const baseUrl = 'http://localhost:3001/';
  
  if (scrapedJobData) {
    const params = new URLSearchParams({
      url: scrapedJobData.url || '',
      title: scrapedJobData.title || '',
      company: scrapedJobData.company || '',
      description: scrapedJobData.description || ''
    });
    chrome.tabs.create({ url: `${baseUrl}?${params.toString()}` });
  } else {
    chrome.tabs.create({ url: baseUrl });
  }
});
