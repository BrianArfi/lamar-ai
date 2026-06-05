/**
 * Career-Ops Chrome Extension Content Script
 * Scrapes JDs directly from user's active browser window.
 * Bypasses Cloudflare & IP blocks by running on the user's active residential IP.
 * Includes Form Detector and AI Auto-filler execution client-side.
 */

// Helper to wait for elements or delay actions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function autoExpandLinkedIn() {
  // Find the "See more" button in LinkedIn job description card and click it if present
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
      await delay(150); // Wait briefly for DOM to expand
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

    // LinkedIn Job Page parsing - Multiple Selectors
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

  } else if (url.includes('glints.com')) {
    // Glints ID Parsing
    const titleEl = document.querySelector('h1[class*="JobCard__Title"]') || 
                    document.querySelector('h1[class*="OpportunityHeader__Title"]') ||
                    document.querySelector('h1[class*="OpportunityHeader__OpportunityTitle"]') ||
                    document.querySelector('h1.OpportunityHeader__Title-sc-') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('div[class*="OpportunityHeader__CompanyName"]') || 
                      document.querySelector('a[href*="/companies/"]') ||
                      document.querySelector('div[class*="OpportunityHeader__Company"]') ||
                      document.querySelector('div.OpportunityHeader__Company-sc-');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('div[class*="OpportunityDescription__OpportunityDescriptionContainer"]') ||
                   document.querySelector('div[class*="OpportunityDescriptionContainer"]') ||
                   document.querySelector('main article') ||
                   document.querySelector('.job-description-content');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('kalibrr.com')) {
    // Kalibrr ID Parsing
    const titleEl = document.querySelector('h1.k-text-title') || 
                    document.querySelector('h1[itemprop="title"]') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('a.k-text-primary-color') || 
                      document.querySelector('span[itemprop="name"] a') ||
                      document.querySelector('div.k-company-info a');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('div.k-description') || 
                   document.querySelector('div[itemprop="description"]');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('jobstreet.co.id') || url.includes('jobstreet.com')) {
    // JobStreet ID Parsing
    const titleEl = document.querySelector('h1[data-automation="job-detail-title"]') || 
                    document.querySelector('h1[data-automation="title"]') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('span[data-automation="advertiser-name"]') || 
                      document.querySelector('a[data-automation="advertiser-name"]');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('div[data-automation="jobDescription"]') || 
                   document.querySelector('div[data-automation="job-details"]');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('indeed.com') || url.includes('indeed.co.id')) {
    // Indeed ID Parsing
    const titleEl = document.querySelector('h1.jobsearch-JobInfoHeader-title') || 
                    document.querySelector('h1[data-testid="jobsearch-JobInfoHeader-title"]') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('div[data-company-name="true"] a') || 
                      document.querySelector('div.jobsearch-CompanyInfoContainer a') ||
                      document.querySelector('div.jobsearch-InlineCompanyRating');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('div#jobDescriptionText') || 
                   document.querySelector('div.jobsearch-jobDescriptionText');
    description = descEl ? descEl.innerText.trim() : '';

  } else if (url.includes('techinasia.com')) {
    // Tech in Asia Parsing
    const titleEl = document.querySelector('h1.job-post-title') || 
                    document.querySelector('h1[class*="title"]') ||
                    document.querySelector('h1');
    title = titleEl ? titleEl.innerText.trim() : '';

    const companyEl = document.querySelector('div.company-name') || 
                      document.querySelector('div[class*="companyName"] a') ||
                      document.querySelector('a[href*="/companies/"]');
    company = companyEl ? companyEl.innerText.trim() : '';

    const descEl = document.querySelector('div.job-post-description') || 
                   document.querySelector('div[class*="description"]');
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

function detectFormFields() {
  const fields = [];
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(el => {
    // Visibility checks
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || el.type === 'hidden') {
      return;
    }
    
    // Ignore unrelated input elements
    const type = (el.type || el.tagName.toLowerCase()).toLowerCase();
    if (['submit', 'button', 'image', 'file', 'checkbox', 'radio'].includes(type)) {
      return;
    }
    
    const id = el.id || '';
    const name = el.name || '';
    const placeholder = el.placeholder || '';
    const ariaLabel = el.getAttribute('aria-label') || '';
    
    // 1. Try label with matching 'for' attribute
    let label = '';
    if (id) {
      const labelEl = document.querySelector(`label[for="${id}"]`);
      if (labelEl) {
        label = labelEl.innerText.trim();
      }
    }
    
    // 2. Try closest parent label
    if (!label) {
      const parentLabel = el.closest('label');
      if (parentLabel) {
        label = parentLabel.innerText.trim();
      }
    }
    
    // 3. Look in parent containers for label tags or descriptive text
    if (!label) {
      const container = el.closest('div');
      if (container) {
        const internalLabel = container.querySelector('label');
        if (internalLabel) {
          label = internalLabel.innerText.trim();
        } else {
          // Look for text node before the input
          const text = container.innerText.trim();
          if (text) {
            const textLines = text.split('\n');
            label = textLines[0].trim();
          }
        }
      }
    }
    
    // Clean label text
    label = label.replace(/\s+/g, ' ').replace(/[*:]/g, '').trim();
    
    if (label.length > 100) {
      label = label.slice(0, 100) + '...';
    }

    fields.push({
      id,
      name,
      label: label || placeholder || ariaLabel || name || id || 'Form Question',
      type,
      placeholder
    });
  });

  return fields;
}

function fillFormFields(data) {
  let filledCount = 0;
  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;
    
    // Find input by ID or name
    let el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    
    if (!el) {
      // Match by placeholder or aria-label
      el = document.querySelector(`[placeholder="${key}"]`) || 
           document.querySelector(`[aria-label="${key}"]`);
    }
    
    if (!el) {
      // Partial matching for ID or name attributes
      el = document.querySelector(`input[id*="${key}"], textarea[id*="${key}"], select[id*="${key}"]`) ||
           document.querySelector(`input[name*="${key}"], textarea[name*="${key}"], select[name*="${key}"]`);
    }

    if (el) {
      el.value = value;
      // Dispatch events for SPA frameworks (React, Vue, Angular)
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }
  }
  return { success: true, filledCount };
}

// Listen for action triggers from popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    extractJobDetails()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  } else if (request.action === 'detectFields') {
    try {
      const fields = detectFormFields();
      sendResponse({ success: true, fields });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'fillFields') {
    try {
      const result = fillFormFields(request.data);
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return false;
});
