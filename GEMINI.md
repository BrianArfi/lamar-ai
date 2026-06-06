@./AGENTS.md
<!-- Add anything Gemini specific that other agents don't need -->

## MANDATORY DIRECT LINK POLICY
- NEVER present generic job board homepages (e.g., greenhouse.io, ashbyhq.com, weworkremotely.com) or company career main pages (e.g., company.com/careers).
- ALWAYS perform additional searches or use browser tools to resolve the final, exact direct job posting URL (e.g., jobs.ashbyhq.com/company/job-id or boards.greenhouse.io/company/jobs/job-id) containing the full Job Description (JD).
- If a specific direct link cannot be found after deep search, explicitly state that the direct link is unavailable and provide the exact search keywords instead of a generic homepage.
- **ATS Bypass Technique for AI (Workable / Teamtailor):**
  - Many modern job boards are SPA-based and render blank content when fetched using standard non-JS HTTP requests.
  - To bypass this, check for their AI/LLM text feeds. For Workable, check `https://apply.workable.com/{company}/llms.txt` and fetch `https://apply.workable.com/{company}/jobs.md` to get the list of direct apply links.
  - For Teamtailor, check `https://careers.{company}.io/llms.txt` or `https://{company}.teamtailor.com/jobs.md` to read the direct links.

