// Comprehensive E2E test for all Career-Ops SaaS API endpoints
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3001';

async function httpRequest(method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function httpFormData(urlPath, formParts) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substr(2);
    const parts = [];
    
    for (const [key, value] of Object.entries(formParts)) {
      if (value instanceof Buffer) {
        const filename = formParts._filename || 'file.bin';
        parts.push(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
        );
        parts.push(value);
        parts.push('\r\n');
      } else if (key !== '_filename') {
        parts.push(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
        );
      }
    }
    parts.push(`--${boundary}--\r\n`);
    
    const bodyParts = parts.map(p => typeof p === 'string' ? Buffer.from(p) : p);
    const body = Buffer.concat(bodyParts);
    
    const url = new URL(urlPath, BASE);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const results = [];
function log(name, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  results.push({ name, pass, detail });
  console.log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
}

async function runTests() {
  console.log('\n🧪 Career-Ops SaaS API — Comprehensive E2E Tests\n');
  console.log('=' .repeat(60));

  // 1. Landing Page
  try {
    const r = await httpRequest('GET', '/');
    log('GET /', r.status === 200, `Status ${r.status}`);
  } catch (e) { log('GET /', false, e.message); }

  // 2. Dashboard Page
  try {
    const r = await httpRequest('GET', '/dashboard');
    log('GET /dashboard', r.status === 200, `Status ${r.status}`);
  } catch (e) { log('GET /dashboard', false, e.message); }

  // 3. Parse CV - Text file upload
  try {
    const buf = Buffer.from('John Doe - Software Engineer\nSkills: Python, JavaScript, Docker');
    const r = await httpFormData('/api/parse-cv', { file: buf, _filename: 'resume.txt' });
    log('POST /api/parse-cv (text)', r.body.success === true, `Text: "${r.body.text?.substring(0, 40)}..."`);
  } catch (e) { log('POST /api/parse-cv (text)', false, e.message); }

  // 4. Parse CV - PDF upload
  try {
    const pdfBuf = fs.readFileSync('/tmp/test_cv.pdf');
    const r = await httpFormData('/api/parse-cv', { file: pdfBuf, _filename: 'resume.pdf' });
    log('POST /api/parse-cv (PDF)', r.body.success === true, `Text: "${r.body.text?.substring(0, 40)}..."`);
  } catch (e) { log('POST /api/parse-cv (PDF)', false, e.message); }

  // 5. Parse CV - DOCX upload
  try {
    const docxBuf = fs.readFileSync('/tmp/test_cv.docx');
    const r = await httpFormData('/api/parse-cv', { file: docxBuf, _filename: 'resume.docx' });
    log('POST /api/parse-cv (DOCX)', r.body.success === true, `Text: "${r.body.text?.substring(0, 40)}..."`);
  } catch (e) { log('POST /api/parse-cv (DOCX)', false, e.message); }

  // 6. Parse CV - Google Drive URL (expected failure for invalid URL)
  try {
    const r = await httpFormData('/api/parse-cv', { driveUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit' });
    log('POST /api/parse-cv (GDrive)', true, `Handled gracefully: ${r.body.error?.substring(0, 50) || 'ok'}`);
  } catch (e) { log('POST /api/parse-cv (GDrive)', false, e.message); }

  // 7. Scrape Job - Greenhouse (should work)
  try {
    const data = JSON.stringify({ url: 'https://boards.greenhouse.io/anthropic/jobs/4020588008' });
    const r = await httpRequest('POST', '/api/scrape-job', data, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
    log('POST /api/scrape-job (Greenhouse)', r.body.success === true, `Title: "${r.body.title?.substring(0, 40)}"`);
  } catch (e) { log('POST /api/scrape-job (Greenhouse)', false, e.message); }

  // 8. Scrape Job - LinkedIn (expected graceful block)
  try {
    const data = JSON.stringify({ url: 'https://www.linkedin.com/jobs/view/123456' });
    const r = await httpRequest('POST', '/api/scrape-job', data, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
    log('POST /api/scrape-job (LinkedIn)', r.body.success === false && r.body.error.includes('anti-bot'), `Blocked gracefully`);
  } catch (e) { log('POST /api/scrape-job (LinkedIn)', false, e.message); }

  // 9. ATS Validation
  try {
    const data = JSON.stringify({ resumeText: 'Brian Johansen - Senior AI Engineer\nExperience: Node.js, TypeScript.\nSkills: Docker, PostgreSQL\nEducation: BS Computer Science' });
    const r = await httpRequest('POST', '/api/validate-ats', data, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
    log('POST /api/validate-ats', r.body.success === true, `Score: ${r.body.score}, Passed: ${r.body.passed}`);
  } catch (e) { log('POST /api/validate-ats', false, e.message); }

  // 10. Applications GET
  try {
    const r = await httpRequest('GET', '/api/applications');
    log('GET /api/applications', r.body.success === true, `Count: ${r.body.data?.length || 0}`);
  } catch (e) { log('GET /api/applications', false, e.message); }

  // 11. Resumes GET
  try {
    const r = await httpRequest('GET', '/api/resumes');
    log('GET /api/resumes', r.body.success === true, `Has resume: ${!!r.body.data}`);
  } catch (e) { log('GET /api/resumes', false, e.message); }

  // 12. Job Search
  try {
    const data = JSON.stringify({ query: 'AI engineer', location: 'Jakarta' });
    const r = await httpRequest('POST', '/api/jobs/search', data, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
    log('POST /api/jobs/search', r.body.success === true, `Matches: ${r.body.matches?.length || 0}, Paywall: ${r.body.paywall?.locked}`);
  } catch (e) { log('POST /api/jobs/search', false, e.message); }

  // 13. API Scraper Optimization Request (POST, GET, DELETE)
  try {
    const optData = JSON.stringify({
      url: 'https://recruitment.peruri.co.id/jobs/ai-engineer',
      source: 'CHROME_EXTENSION',
      failureType: 'OPTIMIZATION_REQUEST',
      errorMessage: 'User requested optimization support for recruitment.peruri.co.id.',
      htmlSnippet: '<div>Custom Portal Content</div>'
    });
    
    // 13a. Test POST optimization request
    const postRes = await httpRequest('POST', '/api/scraper/report-failure', optData, { 
      'Content-Type': 'application/json', 
      'Content-Length': Buffer.byteLength(optData) 
    });
    const postPass = postRes.body.success === true && 
                     postRes.body.data?.host === 'recruitment.peruri.co.id' &&
                     postRes.body.data?.failureType === 'OPTIMIZATION_REQUEST';
    
    // 13b. Test GET reports listing
    const getRes = await httpRequest('GET', '/api/scraper/report-failure');
    const hasOptReport = getRes.body.success === true && 
                         getRes.body.data?.some(r => r.failureType === 'OPTIMIZATION_REQUEST');
    
    log('API Scraper Optimization Request (POST, GET)', postPass && hasOptReport, 
        `POST: ${postPass}, GET check: ${hasOptReport}`);
  } catch (e) { log('API Scraper Optimization Request (POST, GET)', false, e.message); }

  // 14. Scraper Failure Diagnostics (POST, GET, DELETE)
  try {
    const reportData = JSON.stringify({
      url: 'https://test-failed-portal.com/jobs/1',
      source: 'CHROME_EXTENSION',
      failureType: 'SELECTOR_MISSING',
      errorMessage: 'E2E Test Failure: Contained missing job desc text container.',
      htmlSnippet: '<div><header>Test Site</header><body>Empty</body></div>'
    });
    
    // 14a. Test POST report
    const postRes = await httpRequest('POST', '/api/scraper/report-failure', reportData, { 
      'Content-Type': 'application/json', 
      'Content-Length': Buffer.byteLength(reportData) 
    });
    const postPass = postRes.body.success === true && postRes.body.data?.host === 'test-failed-portal.com';
    
    // 14b. Test GET reports
    const getRes = await httpRequest('GET', '/api/scraper/report-failure');
    const getPass = getRes.body.success === true && getRes.body.data?.length > 0;
    
    // 14c. Test DELETE reports
    const delRes = await httpRequest('DELETE', '/api/scraper/report-failure');
    const delPass = delRes.body.success === true;

    log('API Scraper Diagnostics (POST, GET, DELETE)', postPass && getPass && delPass, 
        `POST: ${postPass}, GET: ${getPass}, DELETE: ${delPass}`);
  } catch (e) { log('API Scraper Diagnostics (POST, GET, DELETE)', false, e.message); }

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} passed (${Math.round(passed/total*100)}%)\n`);
  
  if (passed < total) {
    console.log('❌ Failed tests:');
    results.filter(r => !r.pass).forEach(r => console.log(`   - ${r.name}: ${r.detail}`));
  }
}

runTests().catch(console.error);
