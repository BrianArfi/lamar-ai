import { NextResponse } from 'next/server';

const REQUIRED_ATS_HEADINGS = [
  { name: 'EXPERIENCE', patterns: ['experience', 'work history', 'employment history', 'professional background', 'work experience', 'career history', 'employment summary'] },
  { name: 'EDUCATION', patterns: ['education', 'academic background', 'academic history', 'education history', 'qualifications', 'degrees', 'academic record'] },
  { name: 'SKILLS', patterns: ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'skills & tools', 'areas of expertise'] },
  { name: 'PROJECTS', patterns: ['projects', 'personal projects', 'key projects', 'featured projects', 'portfolio', 'selected projects'] }
];

const FORBIDDEN_ATS_PATTERNS = [
  { name: 'Flex Row-Reverse', regex: /flex-direction\s*:\s*row-reverse/i, severity: 'HIGH' },
  { name: 'Table Layouts', regex: /<table/i, severity: 'MEDIUM' },
  { name: 'Two-Column Sidebar Grid', regex: /grid-template-columns\s*:\s*[^;]*[2-9]col/i, severity: 'HIGH' },
  { name: 'Vector SVG Text', regex: /<svg[^>]*><text/i, severity: 'HIGH' },
  { name: 'Float Sidebars', regex: /float\s*:\s*(left|right)/i, severity: 'MEDIUM' }
];

export async function POST(request: Request) {
  try {
    const { resumeText, htmlContent } = await request.json();
    
    let score = 100;
    const warnings: Array<{ type: string; msg: string; severity: string }> = [];

    const textToCheck = (resumeText || htmlContent || '').toLowerCase();
    
    // Check Required Headings
    for (const headingSpec of REQUIRED_ATS_HEADINGS) {
      const found = headingSpec.patterns.some(pattern => textToCheck.includes(pattern));
      if (!found) {
        score -= 15;
        warnings.push({
          type: 'MISSING_HEADING',
          msg: `Required ATS section keyword '${headingSpec.name}' not found. Standard patterns like ${headingSpec.patterns.slice(0, 3).map(p => `'${p.toUpperCase()}'`).join(' or ')} are missing. ATS parsers might fail to identify this block.`,
          severity: 'HIGH'
        });
      }
    }

    // Scan for parsing layout issues if HTML is provided
    if (htmlContent) {
      for (const pattern of FORBIDDEN_ATS_PATTERNS) {
        if (pattern.regex.test(htmlContent)) {
          score -= pattern.severity === 'HIGH' ? 20 : 10;
          warnings.push({
            type: 'COMPATIBILITY_ISSUE',
            msg: `Detected non-compliant layout style: '${pattern.name}'. This may scramble read order in standard parsers like Workday/Taleo.`,
            severity: pattern.severity
          });
        }
      }
    }

    // Check for email & phone format
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

    if (!emailRegex.test(textToCheck) && !emailRegex.test(htmlContent || '')) {
      score -= 10;
      warnings.push({
        type: 'MISSING_CONTACT',
        msg: 'No valid email address format detected. Parsers will fail to identify contact methods.',
        severity: 'MEDIUM'
      });
    }

    return NextResponse.json({
      success: true,
      score: Math.max(0, score),
      passed: score >= 70,
      warnings
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
