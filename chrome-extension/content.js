/**
 * Career-Ops Chrome Extension Content Script
 * Scrapes JDs directly from user's active browser window.
 * Bypasses Cloudflare & IP blocks by running on the user's active residential IP.
 */

// Helper to wait for elements or delay actions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function autoExpandLinkedIn() {
  // 1. Find the "See more" button in LinkedIn job description card and click it if present
  const seeMoreButtons = [
    'button.jobs-description__footer-button',
    'button[aria-label*="See more"]',
    '.jobs-description__footer-button',
    'button.show-more-less-html__button'
  ];

  for (const selector of seeMoreButtons) {
    const btn = document.querySelector(selector);
    if (btn && btn.innerText.toLowerCase().includes('see more')) {
      btn.click();
      await delay(100); // Wait briefly for DOM to expand
      break;
    }
  }
}

async function extractJobDetails() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let description = '';

  if (url.includes('linkedin.com')) {
    // Make sure we auto-expand the description first
    await autoExpandLinkedIn();

    // LinkedIn Job Page parsing - Multiple Robust Selectors (fallback chain)
    const titleSelectors = [
      'h1.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      'h1'
    ];
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim()) {
        title = el.innerText.trim();
        break;
      }
    }

    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-post-apply-header__company-name',
      '.topcard__org-name-link',
      '.job-details-jobs-unified-top-card__primary-description a'
    ];
    for (const sel of companySelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim()) {
        company = el.innerText.trim();
        break;
      }
    }

    const descSelectors = [
      '#job-details',
      '.jobs-description__content',
      '.jobs-box__html-content',
      '.show-more-less-html__markup',
      'article.jobs-description__container'
    ];
    for (const sel of descSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim()) {
        description = el.innerText.trim();
        break;
      }
    }

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

  // Fallback for general/unsupported sites
  if (!title) {
    const fallbackTitle = document.querySelector('h1') || document.querySelector('title');
    title = fallbackTitle ? fallbackTitle.innerText.trim().replace(/\s+/g, ' ') : '';
  }
  if (!company) {
    // Try to extract company name from og:site_name meta tag
    const metaCompany = document.querySelector('meta[property="og:site_name"]') || document.querySelector('meta[name="twitter:site"]');
    if (metaCompany && metaCompany.content) {
      company = metaCompany.content.trim();
    } else {
      // Fallback: use domain name
      try {
        company = new URL(url).hostname.replace('www.', '').split('.')[0];
        // Capitalize
        company = company.charAt(0).toUpperCase() + company.slice(1);
      } catch {
        company = 'Custom Portal';
      }
    }
  }
  if (!description) {
    // Universal Smart Density Parser
    let bestContainer = null;
    let maxScore = -1;

    const containers = document.querySelectorAll('div, section, article, main');
    const careerKeywords = ['requirement', 'qualification', 'experience', 'skills', 'responsibility', 'kualifikasi', 'persyaratan', 'tanggung jawab', 'pengalaman'];

    containers.forEach(el => {
      // Ignore very large wrapper blocks or very small elements
      const textLen = el.innerText ? el.innerText.trim().length : 0;
      if (textLen < 300 || textLen > 25000) return;

      // Count word count
      const words = el.innerText.split(/\s+/).length;
      if (words < 50) return;

      // Check keyword density
      let keywordMatches = 0;
      const textLower = el.innerText.toLowerCase();
      careerKeywords.forEach(kw => {
        if (textLower.includes(kw)) keywordMatches++;
      });

      // Calculate score
      const score = words * (keywordMatches + 1);
      if (score > maxScore) {
        maxScore = score;
        bestContainer = el;
      }
    });

    if (bestContainer) {
      console.log(`[Universal Scraper] Found best container with score ${maxScore}`);
      description = bestContainer.innerText.trim();
    } else {
      // Absolute fallback
      description = document.body ? document.body.innerText.slice(0, 15000) : '';
    }
  }

  return { title, company, description, url };
}

// Listen for scrape request from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    extractJobDetails()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
  }
  return true; // Keep channel open for async response
});
