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

let scrapedJobData = null;

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
    lblTitle.innerText = "Job Listing Detected";
    lblCompany.innerText = "Click below to scan and evaluate.";
    btnEvaluate.disabled = false;
    
    // Trigger silent scrape
    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (response && response.success) {
        scrapedJobData = response.data;
        lblTitle.innerText = scrapedJobData.title || "Job Listing Detected";
        lblCompany.innerText = scrapedJobData.company || "Unknown Company";
      } else {
        statusMsg.innerText = "Failed to extract DOM automatically. Try clicking analyze.";
      }
    });
  } else {
    lblTitle.innerText = "Portal Not Supported";
    lblCompany.innerText = "Navigate to a job page on LinkedIn, Greenhouse, Lever, Ashby, or Workday.";
    btnEvaluate.disabled = true;
  }
});

// Handle analysis trigger
btnEvaluate.addEventListener('click', async () => {
  if (!scrapedJobData) {
    statusMsg.innerText = "No scraped data found. Refresh page and try again.";
    return;
  }

  btnEvaluate.disabled = true;
  btnEvaluate.innerText = "Analyzing via SaaS API...";
  statusMsg.innerText = "Sending job details to SaaS Matchmaker...";

  try {
    // Simulate API Call to SaaS backend /api/evaluate
    // In production, this would make an authenticated fetch request:
    // const res = await fetch('https://api.career-ops.com/v1/evaluate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify(scrapedJobData)
    // });
    // const result = await res.json();

    setTimeout(() => {
      // Mocked response for demo purposes
      statusMsg.innerText = "Analysis Complete!";
      btnEvaluate.style.display = 'none';
      resultContainer.style.display = 'block';

      // Example result based on keyword search
      const text = (scrapedJobData.description || '').toLowerCase();
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

  } catch (error) {
    statusMsg.innerText = "API Error: " + error.message;
    btnEvaluate.disabled = false;
    btnEvaluate.innerText = "Analyze Match & Customize CV";
  }
});

btnSaaS.addEventListener('click', () => {
  // Open SaaS web app dashboard
  chrome.tabs.create({ url: 'https://app.career-ops.com/dashboard' });
});
