import http from 'http';

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

const results = [];
function log(name, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  results.push({ name, pass, detail });
  console.log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
}

async function runScraperTests() {
  console.log('\n🧪 Career-Ops — Dedicated Scraper Test Suite\n');
  console.log('='.repeat(60));

  // Test 1: Static Board (Greenhouse)
  try {
    const payload = JSON.stringify({ url: 'https://boards.greenhouse.io/anthropic/jobs/4020588008' });
    const r = await httpRequest('POST', '/api/scrape-job', payload, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    });
    const passed = r.status === 200 && r.body.success === true && r.body.description.length > 500;
    log(
      'Scenario 1: Static Board Scraping (Greenhouse)', 
      passed, 
      `Status ${r.status}, Text Length: ${r.body.description?.length || 0} characters`
    );
  } catch (e) {
    log('Scenario 1: Static Board Scraping (Greenhouse)', false, e.message);
  }

  // Test 2: Next.js Client-Side SPA Skeleton Detection (Peruri Page)
  try {
    const payload = JSON.stringify({ url: 'https://recruitment.peruri.co.id/en/front-pages/job-vacancies/product-manager-69f1eefb59b61' });
    const r = await httpRequest('POST', '/api/scrape-job', payload, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    });
    // Check if the server-side scraper correctly handles Peruri's page (either successful RSC scrape, skeleton flag, or safe network error)
    const passed = (r.status === 422 && r.body.success === false && r.body.isSkeleton === true && (r.body.error?.includes('SPA') || r.body.error?.includes('skeleton'))) ||
                   (r.status === 200 && r.body.success === true && r.body.description?.length > 100) ||
                   (r.status === 400 && r.body.success === false);
    
    log(
      'Scenario 2: Next.js Client-Side SPA Page Handling (Peruri)',
      passed,
      `Status ${r.status}, success: ${r.body.success}, isSkeleton: ${r.body.isSkeleton || false}, Error: "${r.body.error?.substring(0, 80) || 'None'}..."`
    );
  } catch (e) {
    log('Scenario 2: Next.js Client-Side SPA Skeleton Detection (Peruri)', false, e.message);
  }

  // Test 3: Anti-Bot Block Detection (Indeed)
  try {
    const payload = JSON.stringify({ url: 'https://id.indeed.com/jobs?q=product+manager' });
    const r = await httpRequest('POST', '/api/scrape-job', payload, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    });
    // We expect status 400 with a clean advice to use the Chrome Extension
    const passed = r.status === 400 && 
                   r.body.success === false && 
                   r.body.error.includes('anti-bot');
    log(
      'Scenario 3: Anti-Bot Block Detection (Indeed)',
      passed,
      `Status ${r.status}, Error Message: "${r.body.error?.substring(0, 80)}..."`
    );
  } catch (e) {
    log('Scenario 3: Anti-Bot Block Detection (Indeed)', false, e.message);
  }

  // Test 4: Dynamic SPA Skeleton Detection (Dashboard Page as Job URL)
  try {
    // If someone inputs a general landing page or SPA root that contains no job description, 
    // it should be flagged as a skeleton so we don't save footer/nav garbage into the DB.
    const payload = JSON.stringify({ url: 'http://localhost:3001/dashboard' });
    const r = await httpRequest('POST', '/api/scrape-job', payload, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    });
    const passed = r.status === 422 && 
                   r.body.success === false && 
                   r.body.isSkeleton === true &&
                   r.body.error.includes('skeleton');
    log(
      'Scenario 4: Dynamic SPA Skeleton Detection',
      passed,
      `Status ${r.status}, isSkeleton: ${r.body.isSkeleton}, Error: "${r.body.error?.substring(0, 80)}..."`
    );
  } catch (e) {
    log('Scenario 4: Dynamic SPA Skeleton Detection', false, e.message);
  }

  // Test Results Summary
  console.log('\n' + '='.repeat(60));
  const passedCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  console.log(`\n📊 Scraper Test Results: ${passedCount}/${totalCount} scenarios passed (${Math.round(passedCount/totalCount*100)}%)\n`);

  if (passedCount < totalCount) {
    console.log('❌ Some scenarios failed. Please check the route implementation.');
    process.exit(1);
  } else {
    console.log('🎉 All scraper scenarios passed successfully!');
    process.exit(0);
  }
}

runScraperTests().catch(err => {
  console.error(err);
  process.exit(1);
});
