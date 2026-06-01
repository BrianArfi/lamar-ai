import { NextResponse } from 'next/server';
import prisma from '../../lib/db';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
    }

    // Intercept LinkedIn immediately as it is 100% blocked server-side
    if (url.includes('linkedin.com')) {
      return NextResponse.json({
        success: false,
        error: 'LinkedIn utilizes strict anti-bot authentication gates. Server-side scraping is blocked by LinkedIn login walls. To parse this job description automatically, please use the Career-Ops Chrome Extension or simply copy-paste the Job Description text directly into the textarea.'
      }, { status: 400 });
    }

    console.log(`🌐 Scrape request received for URL: ${url}`);

    let response;
    try {
      response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
        }
      });
    } catch (fetchErr: any) {
      console.error('Fetch error:', fetchErr);
      return NextResponse.json({
        success: false,
        error: `Unable to access job link. The host network may have blocked the connection. Please use the Career-Ops Chrome Extension to scan this page locally in your browser, or copy-paste the description text manually.`
      }, { status: 400 });
    }

    // Handle Cloudflare/Datadome anti-bot blockages (e.g. 403 Forbidden or 503)
    if (!response.ok) {
      console.warn(`Anti-bot block triggered on URL: ${url}. Status code: ${response.status}`);
      const platformName = url.includes('glints.com') ? 'Glints' : 
                           url.includes('indeed.com') ? 'Indeed' : 
                           url.includes('jobstreet') ? 'JobStreet' : 'This job board';
      
      // Automatically log Scraper Failure Report
      let host = 'unknown';
      try { host = new URL(url).host; } catch { host = url; }
      try {
        await prisma.scraperFailureReport.create({
          data: {
            url,
            host,
            platform: platformName,
            source: 'SERVER_SIDE',
            failureType: 'ANTI_BOT_BLOCKED',
            errorMessage: `${platformName} returned status ${response.status} (Cloudflare/Datadome block).`
          }
        });
      } catch (dbErr) {
        console.error('Failed to log failure report:', dbErr);
      }
      
      return NextResponse.json({
        success: false,
        error: `${platformName} utilizes strict anti-bot security firewalls (Cloudflare/Datadome). Direct server-side scraping is blocked by their security gates. To parse this job description automatically, please use the Career-Ops Chrome Extension or simply copy-paste the Job Description text directly.`
      }, { status: 400 });
    }

    const html = await response.text();
    let title = '';
    let company = '';
    let description = '';

    // 1. Parsing Greenhouse
    if (url.includes('greenhouse.io') || html.includes('greenhouse.io')) {
      const titleMatch = html.match(/<h1 class="app-title">([\s\S]*?)<\/h1>/i) || html.match(/<h1>([\s\S]*?)<\/h1>/i);
      title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Greenhouse Job';

      const companyMatch = html.match(/<span class="company-name">([\s\S]*?)<\/span>/i) || html.match(/at\s+<span class="company">([\s\S]*?)<\/span>/i);
      company = companyMatch ? companyMatch[1].replace(/<[^>]*>/g, '').replace(/^at\s+/i, '').trim() : 'Greenhouse Company';

      const bodyMatch = html.match(/<div id="content">([\s\S]*?)<\/div>/i) || html.match(/<div class="job-board">([\s\S]*?)<\/div>/i);
      description = bodyMatch ? bodyMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    // 2. Parsing Lever
    } else if (url.includes('lever.co') || html.includes('lever.co')) {
      const titleMatch = html.match(/<h2>([\s\S]*?)<\/h2>/i) || html.match(/<h1>([\s\S]*?)<\/h1>/i);
      title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Lever Job';

      const companyMatch = html.match(/<div class="posting-header">[\s\S]*?<a class="logo-link"[^>]*>([\s\S]*?)<\/a>/i);
      company = companyMatch ? companyMatch[1].replace(/<[^>]*>/g, '').trim() : 'Lever Company';

      const bodyMatch = html.match(/<div class="section-wrapper[^"]*">([\s\S]*?)<\/div>/i) || html.match(/<div class="posting-content">([\s\S]*?)<\/div>/i);
      description = bodyMatch ? bodyMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    }

    // 3. Extract Next.js streaming React Server Components (RSC) chunks if present
    let rscText = '';
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      const scriptContent = scriptMatch[1];
      if (scriptContent.includes('self.__next_f.push')) {
        const firstQuote = scriptContent.indexOf('"');
        const lastQuote = scriptContent.lastIndexOf('"');
        if (firstQuote !== -1 && lastQuote !== -1 && lastQuote > firstQuote) {
          const rawStr = scriptContent.substring(firstQuote + 1, lastQuote);
          const cleaned = rawStr
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\t/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\/g, ' ');
          rscText += cleaned + ' ';
        }
      }
    }

    console.log(`[Scraper Log] HTML length: ${html.length}, RSC Content length: ${rscText.length}`);

    // 4. General Parsing Fallback
    if (!description) {
      // Extract title
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Scraped Job';

      // Parse text out of body tag
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let bodyText = bodyMatch ? bodyMatch[1] : html;

      // Inject RSC text if available (prepended so it is not sliced off by the 8000-character limit)
      if (rscText) {
        bodyText = rscText + ' ' + bodyText;
      }

      // Remove script & style tags
      bodyText = bodyText
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      description = bodyText.slice(0, rscText ? 35000 : 8000); // Grab up to 35KB if RSC is present, else 8KB
      company = 'Web Portal';
    }

    // Try to extract dynamic page title from next RSC data if generic
    if (title === 'Scraped Job' && rscText) {
      const titleRsc = rscText.match(/children\s*:\s*"\s*([^"]+?)\s*-\s*PERURI/i) || rscText.match(/children\s*:\s*"\s*([^"]+?)\s*Career/i);
      if (titleRsc) {
        title = titleRsc[1].trim();
      }
    }

    // 5. Skeleton Content Detection
    const descriptionLower = description.toLowerCase();
    const hasCareerKeywords = 
      descriptionLower.includes('requirement') ||
      descriptionLower.includes('qualif') ||
      descriptionLower.includes('kualifikasi') ||
      descriptionLower.includes('persyaratan') ||
      descriptionLower.includes('tanggung jawab') ||
      descriptionLower.includes('responsibilit') ||
      descriptionLower.includes('experience') ||
      descriptionLower.includes('pengalaman');

    const isSkeleton = description.length < 300 || !hasCareerKeywords;

    if (isSkeleton && !url.includes('greenhouse.io') && !url.includes('lever.co')) {
      console.warn(`[Scraper Alert] Skeleton content detected for URL: ${url}`);
      
      // Automatically log Scraper Failure Report
      let host = 'unknown';
      try { host = new URL(url).host; } catch { host = url; }
      try {
        await prisma.scraperFailureReport.create({
          data: {
            url,
            host,
            platform: url.includes('glints.com') ? 'Glints' : 
                      url.includes('indeed.com') ? 'Indeed' : 
                      url.includes('jobstreet') ? 'JobStreet' : 
                      url.includes('kalibrr.com') ? 'Kalibrr' : 'Custom Job Board',
            source: 'SERVER_SIDE',
            failureType: 'SKELETON_DETECTED',
            errorMessage: 'SPA or Client-Side Rendered layout scraped without job description. Text content was too short or did not contain keywords.',
            htmlSnippet: description.slice(0, 1000)
          }
        });
      } catch (dbErr) {
        console.error('Failed to log failure report:', dbErr);
      }

      return NextResponse.json({
        success: false,
        isSkeleton: true,
        error: 'Single-Page Application (SPA) or Client-Side Rendered page detected. The server scraped an empty skeleton/navigation layout without the job description. Please use the Career-Ops Chrome Extension to scan this page locally in your browser, or copy-paste the description text manually.'
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      title,
      company,
      description,
      url
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
