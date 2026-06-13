/**
 * Career-Ops Chrome Extension Content Script
 * Scrapes JDs directly from user's active browser window.
 * Bypasses Cloudflare & IP blocks by running on the user's active residential IP.
 * Includes Form Detector and AI Auto-filler execution client-side.
 *
 * To support a new job portal, add one entry to SITE_PARSERS below (and add the
 * host to manifest.json + config.json knownPortals). Each of title/company/
 * description is a list of sources tried in order — a CSS selector string or a
 * function returning text — and the first non-empty result wins. Sites without
 * a parser automatically fall back to the universal density scanner.
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

const SITE_PARSERS = [
  {
    name: 'LinkedIn',
    match: ['linkedin.com'],
    preExtract: autoExpandLinkedIn, // expand the description before reading it
    title: [
      'h1.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      'h1'
    ],
    company: [
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-post-apply-header__company-name',
      '.topcard__org-name-link',
      '.job-details-jobs-unified-top-card__primary-description a'
    ],
    description: [
      '#job-details',
      '.jobs-description__content',
      '.jobs-box__html-content',
      '.show-more-less-html__markup',
      'article.jobs-description__container'
    ]
  },
  {
    name: 'Glints',
    match: ['glints.com'],
    title: [
      'h1[class*="JobCard__Title"]',
      'h1[class*="OpportunityHeader__Title"]',
      'h1[class*="OpportunityHeader__OpportunityTitle"]',
      'h1.OpportunityHeader__Title-sc-',
      'h1'
    ],
    company: [
      'div[class*="OpportunityHeader__CompanyName"]',
      'a[href*="/companies/"]',
      'div[class*="OpportunityHeader__Company"]',
      'div.OpportunityHeader__Company-sc-'
    ],
    description: [
      'div[class*="OpportunityDescription__OpportunityDescriptionContainer"]',
      'div[class*="OpportunityDescriptionContainer"]',
      'main article',
      '.job-description-content'
    ]
  },
  {
    name: 'Kalibrr',
    match: ['kalibrr.com'],
    title: ['h1.k-text-title', 'h1[itemprop="title"]', 'h1'],
    company: ['a.k-text-primary-color', 'span[itemprop="name"] a', 'div.k-company-info a'],
    description: ['div.k-description', 'div[itemprop="description"]']
  },
  {
    name: 'JobStreet',
    match: ['jobstreet.co.id', 'jobstreet.com'],
    title: ['h1[data-automation="job-detail-title"]', 'h1[data-automation="title"]', 'h1'],
    company: ['span[data-automation="advertiser-name"]', 'a[data-automation="advertiser-name"]'],
    description: ['div[data-automation="jobDescription"]', 'div[data-automation="job-details"]']
  },
  {
    name: 'Indeed',
    match: ['indeed.com', 'indeed.co.id'],
    title: ['h1.jobsearch-JobInfoHeader-title', 'h1[data-testid="jobsearch-JobInfoHeader-title"]', 'h1'],
    company: [
      'div[data-company-name="true"] a',
      'div.jobsearch-CompanyInfoContainer a',
      'div.jobsearch-InlineCompanyRating'
    ],
    description: ['div#jobDescriptionText', 'div.jobsearch-jobDescriptionText']
  },
  {
    name: 'Tech in Asia',
    match: ['techinasia.com'],
    title: ['h1.job-post-title', 'h1[class*="title"]', 'h1'],
    company: ['div.company-name', 'div[class*="companyName"] a', 'a[href*="/companies/"]'],
    description: ['div.job-post-description', 'div[class*="description"]']
  },
  {
    name: 'Greenhouse',
    match: ['greenhouse.io'],
    title: ['.app-title', 'h1'],
    company: ['.company-name', '.company'],
    companyTransform: text => text.replace(/^at\s+/i, ''),
    description: ['#content', '.job-board']
  },
  {
    name: 'Lever',
    match: ['lever.co'],
    title: ['.posting-header h2', 'h1'],
    company: [
      '.posting-header .company-name',
      () => {
        const img = document.querySelector('.logo-link img');
        return img ? (img.alt || img.innerText || '') : '';
      }
    ],
    description: ['.section-wrapper .posting-sections', '.posting-content']
  },
  {
    name: 'Workday',
    match: ['workday.com', 'myworkdayjobs.com'],
    title: ['[data-automation-id="jobPostingHeader"]', 'h1'],
    company: [
      '[data-automation-id="companyName"]',
      () => document.title.split(' - ')[1] || ''
    ],
    description: ['[data-automation-id="jobDescriptionText"]', '.job-description']
  }
];

/**
 * Return the first non-empty text from a list of sources.
 * A source is either a CSS selector string or a function returning text.
 * Bad selectors / throwing functions are skipped so one entry can't break the scan.
 */
function firstText(sources) {
  for (const source of sources || []) {
    try {
      if (typeof source === 'function') {
        const value = (source() || '').trim();
        if (value) return value;
      } else {
        const el = document.querySelector(source);
        if (el) {
          const text = (el.innerText || el.textContent || '').trim();
          if (text) return text;
        }
      }
    } catch (err) {
      // Skip invalid selector or failing custom source, try the next one
    }
  }
  return '';
}

async function extractJobDetails() {
  const url = window.location.href;
  const parser = SITE_PARSERS.find(p => p.match.some(host => url.includes(host)));

  let title = '';
  let company = '';
  let description = '';

  if (parser) {
    if (parser.preExtract) {
      try { await parser.preExtract(); } catch { /* non-fatal */ }
    }
    title = firstText(parser.title);
    company = firstText(parser.company);
    if (company && parser.companyTransform) {
      company = parser.companyTransform(company);
    }
    description = firstText(parser.description);
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
      const labelEl = document.querySelector(`label[for="${cssAttrEscape(id)}"]`);
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

// Escape a value for safe use inside a quoted CSS attribute selector
function cssAttrEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function fillFormFields(data) {
  let filledCount = 0;
  if (!data || typeof data !== 'object') {
    return { success: true, filledCount };
  }

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;

    const k = cssAttrEscape(key);
    let el = document.getElementById(key);

    try {
      if (!el) {
        el = document.querySelector(`[name="${k}"]`);
      }
      if (!el) {
        // Match by placeholder or aria-label
        el = document.querySelector(`[placeholder="${k}"]`) ||
             document.querySelector(`[aria-label="${k}"]`);
      }
      if (!el) {
        // Partial matching for ID or name attributes
        el = document.querySelector(`input[id*="${k}"], textarea[id*="${k}"], select[id*="${k}"]`) ||
             document.querySelector(`input[name*="${k}"], textarea[name*="${k}"], select[name*="${k}"]`);
      }
    } catch (err) {
      continue; // key produced an invalid selector — skip this entry
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
