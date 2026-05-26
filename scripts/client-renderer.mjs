#!/usr/bin/env node

/**
 * client-renderer.mjs — Hybrid Client-Side PDF Renderer & Anonymizer
 * Demonstrates GDPR-compliant resume compiling. 
 * Resolves sensitive contact info locally without sending it to Cloud LLM APIs.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// 1. Simulate Local Storage / Client-Side Secure Store
const localEncryptedStore = {
  fullName: "Brian Johansen",
  email: "brian.johansen@example.com",
  phone: "+62 812-3456-7890",
  address: "Jakarta, Indonesia",
  linkedin: "linkedin.com/in/brianjohansen",
  github: "github.com/brianjohansen"
};

// 2. Anonymized Tailored CV (Extracted from backend DB, processed by LLM without sensitive info)
const anonymizedCvMarkdown = `
# {{FULL_NAME}}
**Target Role:** Senior Applied AI Engineer

---

### Professional Experience

#### Senior AI Engineer at TechCorp (2024 - Present)
- Engineered LLM agents using Gemini Pro & Claude Sonnet to automate internal customer support pipelines, saving $120k annually.
- Integrated vector databases (Pinecone) with semantic search to reduce query latency by 45%.

#### Software Developer at SoftDev Co (2022 - 2024)
- Developed and maintained Node.js REST APIs with PostgreSQL, servicing 50k monthly active users.
- Automated testing suite using Playwright, cutting deployment cycle times by 30%.
`;

/**
 * Compiles anonymized markdown by dynamically injecting client-side personal details.
 * In a production web SaaS, this run in the user's browser right before PDF generation.
 */
function injectPersonalData(markdown, contactDetails) {
  let compiled = markdown;
  
  // Replace Name placeholder
  compiled = compiled.replace(/\{\{FULL_NAME\}\}/g, contactDetails.fullName);

  // Build sleek Contact Information block
  const contactHeader = `
<p align="center">
  <strong>Email:</strong> ${contactDetails.email} | 
  <strong>Phone:</strong> ${contactDetails.phone} | 
  <strong>Location:</strong> ${contactDetails.address} <br>
  <strong>LinkedIn:</strong> <a href="https://${contactDetails.linkedin}">${contactDetails.linkedin}</a> | 
  <strong>GitHub:</strong> <a href="https://${contactDetails.github}">${contactDetails.github}</a>
</p>

---
  `.trim();

  // Inject header right after the main H1 title
  const lines = compiled.split('\n');
  const titleIndex = lines.findIndex(line => line.trim().startsWith('# '));
  
  if (titleIndex !== -1) {
    lines.splice(titleIndex + 1, 0, '\n' + contactHeader);
  }

  return lines.join('\n');
}

async function run() {
  console.log("🔒 Running Hybrid Client-Side Renderer Prototype...");
  console.log("-------------------------------------------------");
  
  console.log("1. Fetching anonymized tailored CV from backend... (Done)");
  console.log("2. Accessing local browser storage for sensitive details... (Done)");
  
  console.log("3. Merging CV with personal details client-side...");
  const finalCv = injectPersonalData(anonymizedCvMarkdown, localEncryptedStore);
  
  console.log("\n--- Generated Compiled Markdown (Ready for Local PDF Print) ---");
  console.log(finalCv.trim());
  console.log("----------------------------------------------------------------");

  // Write a demo file to output/ Jakarta local storage simulation
  const outputDir = join(ROOT, 'output');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(join(outputDir, 'cv-client-rendered-demo.md'), finalCv);
  
  console.log(`\n✅ Client-side compilation succeeded. Saved to: output/cv-client-rendered-demo.md`);
  console.log(`💡 Cloud LLMs only saw the professional achievements, protecting sensitive data!`);
}

run().catch(err => {
  console.error("Renderer failed:", err);
});
