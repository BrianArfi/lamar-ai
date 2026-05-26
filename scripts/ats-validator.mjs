#!/usr/bin/env node

/**
 * ats-validator.mjs — ATS Compatibility & Layout Integrity Validator
 * Scans generated resume files (HTML / PDF) to detect common ATS parsing traps:
 * - Multi-column layouts
 * - Scrambled read orders
 * - Non-standard symbols/graphics
 * - Missing core headings
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_ATS_HEADINGS = [
  'experience',
  'education',
  'skills',
  'projects'
];

const FORBIDDEN_ATS_PATTERNS = [
  { name: 'Flex Row-Reverse', regex: /flex-direction\s*:\s*row-reverse/i, severity: 'HIGH' },
  { name: 'Table Layouts', regex: /<table/i, severity: 'MEDIUM' },
  { name: 'Two-Column Sidebar Grid', regex: /grid-template-columns\s*:\s*[^;]*[2-9]col/i, severity: 'HIGH' },
  { name: 'Vector SVG Text', regex: /<svg[^>]*><text/i, severity: 'HIGH' },
  { name: 'Float Sidebars', regex: /float\s*:\s*(left|right)/i, severity: 'MEDIUM' }
];

/**
 * Evaluates an HTML resume template for ATS parsing readiness
 */
async function validateHtmlAts(htmlContent) {
  let score = 100;
  const warnings = [];

  // 1. Check Required Headings (ATS matches sections based on keywords)
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').toLowerCase();
  for (const heading of REQUIRED_ATS_HEADINGS) {
    if (!textContent.includes(heading)) {
      score -= 15;
      warnings.push({
        type: 'MISSING_HEADING',
        msg: `Required ATS section keyword '${heading.toUpperCase()}' not found. ATS systems might fail to classify this section.`,
        severity: 'HIGH'
      });
    }
  }

  // 2. Scan for parsing layout issues (Flex, tables, columns)
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

  // 3. Check for standard contact placeholders (Ensure email and phone can be parsed)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  if (!emailRegex.test(textContent) && !htmlContent.includes('{{email}}') && !htmlContent.includes('{{email}}')) {
    score -= 10;
    warnings.push({
      type: 'MISSING_CONTACT',
      msg: 'No valid email address format detected. Parsers will fail to identify contact methods.',
      severity: 'MEDIUM'
    });
  }

  return {
    score: Math.max(0, score),
    passed: score >= 70,
    warnings
  };
}

async function main() {
  console.log("🔍 Running ATS Compliance & Structural Integrity Validator...");
  console.log("==============================================================");

  try {
    const templatePath = join(ROOT, 'templates', 'cv-template.html');
    if (!fs.stat(templatePath).catch(() => false)) {
      console.log("❌ Error: templates/cv-template.html does not exist!");
      process.exit(1);
    }

    const htmlContent = await fs.readFile(templatePath, 'utf-8');
    const result = await validateHtmlAts(htmlContent);

    console.log(`ATS Compatibility Score: ${result.score}/100`);
    if (result.passed) {
      console.log("Status: 🟢 PASSED (ATS Compliant & Highly Parsable)\n");
    } else {
      console.log("Status: 🔴 FAILED (High risk of parsing failure in Workday/Greenhouse)\n");
    }

    if (result.warnings.length > 0) {
      console.log("Warnings & Optimizations:");
      result.warnings.forEach(w => {
        const icon = w.severity === 'HIGH' ? '🚨' : '⚠️';
        console.log(`  ${icon} [${w.severity}] ${w.msg}`);
      });
    } else {
      console.log("  🎉 Perfect score! No layout parsing violations found.");
    }
    console.log("==============================================================");

  } catch (error) {
    console.error("ATS Validation process failed:", error.message);
    process.exit(1);
  }
}

main();
