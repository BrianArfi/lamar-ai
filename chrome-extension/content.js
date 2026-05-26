/**
 * Career-Ops Chrome Extension Content Script
 * Scrapes JDs directly from user's active browser window.
 * Bypasses Cloudflare & IP blocks by running on the user's active residential IP.
 */

function extractJobDetails() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let description = '';

  if (url.includes('linkedin.com')) {
    // LinkedIn Job Page parsing
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title') || 
                    document.querySelector('.jobs-unified-top-card__job-title') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
                      document.querySelector('.jobs-unified-top-card__company-name') ||
                      document.querySelector('.jobs-post-apply-header__company-name');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('.jobs-description__content') || 
                   document.querySelector('#job-details') ||
                   document.querySelector('.jobs-box__html-content');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('greenhouse.io')) {
    // Greenhouse parsing
    const titleEl = document.querySelector('.app-title') || document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('.company-name') || document.querySelector('.company');
    company = companyEl ? companyEl.innerText.trim().replace(/^at\s+/i, '') : '';

    const descEl = document.querySelector('#content') || document.querySelector('.job-board');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('lever.co')) {
    // Lever parsing
    const titleEl = document.querySelector('.posting-header h2') || document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('.posting-header .company-name') || document.querySelector('.logo-link img');
    company = companyEl ? (companyEl.alt || companyEl.innerText || '').trim() : '';

    const descEl = document.querySelector('.section-wrapper .posting-sections') || document.querySelector('.posting-content');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('workday.com')) {
    // Workday parsing
    const titleEl = document.querySelector('[data-automation-id="jobPostingHeader"]') || document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('[data-automation-id="companyName"]') || document.title.split(' - ')[1];
    company = companyEl ? companyEl.trim() : '';

    const descEl = document.querySelector('[data-automation-id="jobDescriptionText"]') || document.querySelector('.job-description');
    description = descEl ? descEl.innerText.trim() : '';
  }

  // Fallback for general sites
  if (!title) {
    title = (document.querySelector('h1') || document.querySelector('title')).innerText.trim();
  }
  if (!description) {
    description = document.body.innerText.slice(0, 10000); // Grab body text up to limit
  }

  return { title, company, description, url };
}

// Listen for scrape request from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    try {
      const data = extractJobDetails();
      sendResponse({ success: true, data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep channel open
});
