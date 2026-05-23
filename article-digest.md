# Brian Arfi Faridhi — Achievement Repository

> **Purpose:** Raw, unfiltered repository of every measurable achievement, project, and proof point across Brian's career. Organized by company and domain. Nothing is summarized or cut — pick and choose when tailoring a CV for a specific opportunity.
>
> **Usage:** When evaluating a job or writing a CV, grep for the domain, metric, or skill relevant to that role. Use the `[Tags]` on each entry as filters.
>
> **Last updated:** 2026-05-23 | **Source files:** cv.md, Product Second Brain (WSL)

---

## Table of Contents

1. [Flip — Product Management Lead (2024–2026)](#flip)
   - [Payment Platform](#flip-payment)
   - [Ops Platform & Customer Support Automation](#flip-ops)
   - [FINA — Flip Internal AI (Agentic AI)](#flip-fina)
   - [Gogogo — Gaming Top-Up Ecosystem](#flip-gogogo)
   - [AI Integration for Product Team](#flip-ai-integration)
   - [Multi-Product Leadership & Operations](#flip-leadership)
2. [Merit Incentives — Product Director (2025–Present)](#merit)
3. [Fasset — Director of Products (2023)](#fasset)
4. [Hijra Group — VP of Products (2022–2023)](#hijra)
5. [Tokopedia — Lead Product Manager (2019–2022)](#tokopedia)
6. [Glints — Product Manager (2018–2019)](#glints)
7. [Kitabisa — Product Manager (2018)](#kitabisa)
8. [Founder & Head of Product Era (2006–2018)](#founder)
9. [Awards & Recognition](#awards)

---

<a name="flip"></a>
## Flip — Product Management Lead
**June 2024 – March 2026 | Leading Money Transfer Company in Indonesia**

Responsible for Platform and Internal Products Product Group, as well as launching new products. Scope expanded over time to managing 3 direct teams + overseeing 2 additional teams simultaneously.

**Teams owned:** Core Payment System, Payment Integrations, Reconciliation Services, Risk & Fraud, Help Center, Operations Tooling, Internal Dashboard & Access Control, AI-powered Automation, AI for Research, AI for Customer Support

---

<a name="flip-payment"></a>
### Payment Platform

---

**[ACH-001] Money Transfer Cost Reduction — ~32% in 6 months**
`[Tags: cost-savings, platform, fintech, automation, payments, measurable-impact]`

- **What:** Reduced the unit cost of Money Transfer operations by ~32% in 6 months
- **How:** Reduced API hits (optimizing redundant calls) and reconfigured transfer traffic routing to cheaper/more efficient routes
- **Outcome:** Equivalent to **~USD 2,120,000 in yearly savings**
- **Performance vs target:** Achieved **450% of the initial cost reduction target**
- **Context:** This was the highest-impact single initiative in the Payment Platform domain during H2 2024 / H1 2025

---

**[ACH-002] Out-of-SLA Money Transfer Speed — Reduced by 59%**
`[Tags: reliability, SLA, payments, fintech, measurable-impact]`

- **What:** Reduced the percentage of money transfers that fell outside of SLA (delayed transfers) by 59%
- **How:** Identified and executed high-leverage improvement initiatives targeting the specific routing paths and bank partner integrations responsible for the majority of SLA breaches
- **Outcome:** 59% reduction in out-of-SLA incidents, directly improving customer satisfaction and reducing support ticket volume for transfer complaints
- **Context:** Complemented the cost reduction work — both cost and speed improved simultaneously

---

**[ACH-003] Payment Platform SLA Stabilization (2+ years)**
`[Tags: reliability, SLA, platform, leadership, payments]`

- **What:** Maintained a stable and consistent SLA across the core Payment Platform for 2+ years
- **Context:** Payment Platform was in a more unstable state prior to taking ownership. Over time, incidents became rare compared to the prior state.
- **Evidence:** Stated as a key deliverable in exit conversation: *"SLA has stabilized and remains consistent. Incidents are rare compared to before."*
- **Related:** Bot automation and transfer traffic management cited as specific technical levers

---

**[ACH-004] Payment Platform — RCA and Incident Management**
`[Tags: incident-management, reliability, payments, risk]`

- **What:** Managed and resolved a Double Transfer Incident (Nov 21, 2025) with full Root Cause Analysis documentation
- **Context:** RCA documented in internal system: "RCA Double Transfer Incident 21 Nov 2025"
- **Evidence:** Full incident postmortem produced; used as input for preventive measures

---

<a name="flip-ops"></a>
### Ops Platform & Customer Support Automation

---

**[ACH-005] Customer Support Cost — Slashed 42% in 7 months, saving ~USD 200,000**
`[Tags: cost-savings, AI, automation, ops, measurable-impact, customer-support]`

- **What:** Reduced Flip's customer support operational cost by 42% in 7 months
- **How:** AI-powered automation across multiple ticket categories: refund automation, transaction delay notifications, account management automation, DBD (Funds Not Received) handling
- **Outcome:** ~USD 200,000 in savings; equivalent to eliminating ~4-5 FTE agent cost at ~7-8M IDR/agent/month
- **Scale:** Baseline ~10,000 tickets/month; drove from 0% automated to ~70% automated in the period
- **Context:** This was the core OKR for the Ops Platform team in H1 2025–H1 2026

---

**[ACH-006] Refund Automation — ~90% Coverage, Zero False Positives**
`[Tags: AI, automation, refund, ops, risk, measurable-impact, zero-defect]`

- **What:** Automated ~90% of refund approvals using AI-driven logic
- **Zero false positives record:** The refund automation system maintained zero erroneous disbursements across its entire operating history up to March 2026
- **Limit expansion:** Successfully expanded the automated refund limit from 10,000,000 IDR to 50,000,000 IDR based on the zero-false-positive track record
  - Volume in the 10M–50M range: ~2,900 transactions/day, ~87,000/month
  - Projected ticket deflection from limit expansion alone: ~4,350 tickets/month
- **Target:** Aligned with Q2 2026 goal of >90% full automation coverage
- **PRD:** `PRD_Increase_Refund_Automation_Coverage_50M.md`

---

**[ACH-007] Ticket Automation Roadmap — 70% → 90% coverage**
`[Tags: ops, automation, roadmap, measurable-impact, strategy]`

- **What:** Designed and drove a comprehensive ticket automation roadmap for Flip's Operations team
- **Scale:** ~10,000 monthly agent-handled tickets; target >90% full automation by end Q2 2026
- **Q1 status (at time of handover):** ~7,000 tickets/month addressed (70% coverage); volume trending down
  - Account Status Sync: **Done**
  - Refund Automation: **Active — ~50% reduction from baseline already visible in Feb 2026**
  - Transaction Delay Notification: Active — reduction visible in "Unsuccessful Money Transfer" (baseline 1,778 vs current trend)
  - DBD Handling: Active — reduction visible (1,309 baseline vs 841 in Feb 2026)
- **Q2 additions designed (2,051 tickets/month):**
  - Flip App tech escalation rerouting: 776 tickets/month
  - Digital Product CRM automation: 450 tickets/month
  - Fraud Operations reroute: 410 tickets/month
  - RAG/KB tutorial deflection: 350 tickets/month
  - Enhanced OCR for NIK failures: 65 tickets/month
- **Financial ROI model built:** 9,000 ticket reduction = ~4-5 agent FTE reduction = 28-40M IDR/month savings
- **Source:** `Q2_2026_Ops_Automation_Analysis.md`

---

**[ACH-008] Complaint Ticket Reduction from Fallback Flow — 26.8%**
`[Tags: AI, GenAI, automation, customer-support, measurable-impact]`

- **What:** Reduced complaint tickets originating from Flip's fallback chatbot flow by 26.8%
- **How:** Generative AI improvements to Jingga (the chatbot), improving response accuracy and deflection for common scenarios
- **Context:** Directly reduced agent workload in the category most susceptible to GenAI deflection

---

**[ACH-009] Transaction Delay Notification — Proactive Communication System**
`[Tags: ops, proactive-communication, user-experience, automation]`

- **What:** Designed and launched a proactive delay notification system that alerts users before they need to contact support
- **Impact:** Reduction in "Unsuccessful Money Transfer" support tickets (baseline 1,778; downward trend visible in Feb 2026 data)
- **PRD:** `PRD_Proactive_Delay_Logic_Update.md`

---

**[ACH-010] DBD (Funds Not Received) Handling — Automated Reporting Flow**
`[Tags: automation, ops, banking, measurable-impact]`

- **What:** Automated the reporting flow for cases where bank transfers were marked successful but funds were not received by the recipient
- **Impact:** Reduction in "Successful Money Transfer" complaint tickets (baseline 1,309; 841 in Feb 2026 — 36% reduction)
- **Mechanism:** Automated daily follow-up emails to bank partners; status relay back to users via Jingga

---

**[ACH-011] Fraud Operations Ticket Rerouting — 410 tickets/month removed from Ops**
`[Tags: ops, process-improvement, routing, efficiency]`

- **What:** Designed rerouting solution to remove Fraud Appeal tickets entirely from the Ops agent queue
- **Root cause identified:** Tickets were routed to Ops despite Fraud team having sole resolution authority — a pure routing inefficiency
- **Outcome:** ~410 tickets/month permanently removed from Ops queue via routing configuration change
- **No automation engineering required:** Pure routing fix, zero agent involvement going forward

---

**[ACH-012] Unified Agent Workspace (Yellow.ai Migration) PRD**
`[Tags: ops, tooling, platform, strategy, PRD-writing]`

- **What:** Authored full PRD for replacing Yellow.ai (external chatbot SaaS) with an internal Unified Agent Workspace
- **Business case:** High Yellow.ai licensing costs; fragmented cross-channel interaction history; heavy manual dependency on CAPT team for account adjustments
- **Scope:** Full migration plan including ticketing system migration away from Yellow, BRD for ticketing system replacement, Unified Workspace Phase 1 delivery
- **PRD:** `PRD_Unified_Agent_Workspace.md`
- **Stakeholders:** Head of Ops (Sourabh Gupta), SVP Product (Rizqi Eka Maulana)

---

<a name="flip-fina"></a>
### FINA — Flip Internal AI (Agentic AI)

---

**[ACH-013] FINA Phase 0 PoC — Agentic AI Refund Orchestrator Built in 2 Weeks**
`[Tags: agentic-AI, LLM, AI-product, automation, PoC, measurable-impact]`

- **What:** Built and delivered a working Agentic AI orchestrator (FINA — Flip Internal AI) that autonomously identifies and processes customer refund complaints — end-to-end, without agent intervention
- **Timeframe:** 2-week PoC sprint
- **Capabilities delivered:**
  - 7-scenario NLP orchestration: agent classifies user intent from free-text inputs across 7 distinct transaction complaint scenarios
  - End-to-end refund automation: Scenarios 4, 5, 6 fully functional in staging (wrong bank, double transfer, no transaction found)
  - OCR receipt verification: high-accuracy extraction via Refund Automation OCR
  - Smart handback to Yellow.ai for unsupported cases with full session context passed
  - Cost optimization: prompt consolidation reduced cost to ~$0.004 per turn (Claude 3 Haiku)
- **Leadership demo:** Presented to executive leadership on April 29, 2026
- **Source:** `FINA_Phase0_Progress_Report_English.md`

---

**[ACH-014] FINA — Security Vulnerability Identified and Resolved**
`[Tags: security, agentic-AI, compliance, risk-management]`

- **What:** During FINA development, identified and resolved a critical cross-user data access vulnerability
- **Vulnerability:** Agent was using the TSS (Transaction Service System) internal endpoint — an Ops-facing endpoint with no user-scoped authorization — allowing the agent to query *any user's* transaction history
- **Resolution:** Rerouted all API calls through the HCS (internal gateway), which enforces token-based validation and scopes all queries to the authenticated user's data only
- **Significance:** This fix was mandatory before any user-facing testing — a compliance and security requirement Brian pushed proactively before production readiness
- **Source:** `FINA_Next_Phase_Plan.md` — Finding 8

---

**[ACH-015] FINA — Cost Architecture Design (Scratchpad/Notes Pattern)**
`[Tags: agentic-AI, cost-optimization, LLM, architecture]`

- **What:** Identified that FINA's cost was 7x target (~Rp 2,400/session vs Rp 350 target) and designed the solution architecture to fix it
- **Root cause:** Monolithic prompt loading (~10-11k tokens) re-sent on every conversation turn, compounding costs as conversation grew
- **Solution designed:** Scratchpad/Notes architecture — agent writes a short structured plan/note after each turn; subsequent turns read only the note + minimal system prompt (eliminating full chat history resend) + on-demand skill loading (load only the relevant skill, not all skills at startup)
- **Expected impact:** Token count per turn drops from 10k+ to ~2-3k for most turns after initial setup; target < Rp 500/session (Phase 1 step toward Rp 350 ultimate target) — an 80% cost reduction
- **Source:** `FINA_Next_Phase_Plan.md` — Finding 3

---

**[ACH-016] FINA — AI Thought Logging / Observability Requirement**
`[Tags: agentic-AI, observability, production-readiness, AI-safety]`

- **What:** Defined and pushed "AI Thought Logging" as a production requirement — the ability to inspect every AI decision, prompt, and response at the DB level for every session
- **Why this matters:** During the demo failure, the team could not determine why the AI selected the wrong transaction. Brian stated explicitly: *"This is a requirement for the release version — we need to be able to investigate why the AI made a specific decision."*
- **Requirement:** DB-level decision traces, queryable by session/scenario/date — not just system logs
- **Significance:** Demonstrates production-grade thinking about AI systems: safety, auditability, and responsible deployment

---

**[ACH-017] FINA — Multi-Phase Product Roadmap (Phase 0 → Phase 5)**
`[Tags: agentic-AI, product-roadmap, strategy, AI-product]`

- **What:** Designed and owned the full multi-phase roadmap for FINA from PoC to production-scale deployment
- **Phase 0:** 2-week PoC — 7-scenario orchestration, end-to-end refund automation, leadership demo
- **Phase 1:** Stabilization + cost fix + flow completion — target: internal alpha (20+ employees), cost < Rp 500/session
- **Phase 2:** Ops Admin Console — skill management, analytics, operator controls
- **Phase 3+:** Scaling to additional complaint scenarios, KYC agent, Fraud agent
- **Target metrics for public rollout:** >60% deflection rate, >7.0/10 CSAT
- **Source:** `PRD_FINA_Phase1.md`, `FINA_Next_Phase_Plan.md`

---

**[ACH-018] FINA — AI Product Management Curriculum for PMs**
`[Tags: AI-education, leadership, mentoring, team-development]`

- **What:** Created an AI Product Management learning curriculum for Flip's product managers
- **Context:** Part of the broader AI integration initiative — not just building AI products, but upskilling the PM team to think in AI-native terms
- **Scope:** Covered LLM integration patterns, agentic AI product design, AI-first PRD writing, AI evaluation metrics

---

<a name="flip-gogogo"></a>
### Gogogo — Gaming Top-Up Ecosystem

---

**[ACH-019] Gogogo V2 Architecture Migration — Inquiry Success Rate 40% → 86%**
`[Tags: platform-migration, reliability, measurable-impact, gaming, technical-PM]`

- **What:** Drove and completed the migration of 100% of Gogogo traffic to the V2/Rewrite architecture
- **Outcome:** Inquiry Success Rate improved from **40% to 86%** by optimizing the inquiry parameter handling (switching `is_region` to `false`, eliminating common integration timeouts with Lapak Gaming)
- **Response latency:** Improved response latency from the supply partner (Lapak Gaming)
- **Feature unlock:** Architectural stability allowed the re-introduction of **Roblox 5 Days**, a high-demand product that was previously too unstable to maintain
- **Note on "True Success":** HTTP 200 success = 86%, but True Information Success (valid UID returned) = ~35% — identified this gap as the #1 product hurdle for Q2
- **Source:** `Q1_2026_Gogogo_Learnings.md`, `Q1_2026_Gogogo_Product_Deep_Dive_V2.md`

---

**[ACH-020] Vexa Multi-Supply Failover — Prevented 750M IDR GMV / 60M Margin Loss**
`[Tags: reliability, business-impact, supply-chain, risk-mitigation, measurable-impact]`

- **What:** Integrated Vexa as a secondary supply partner with automatic failover logic (circuit breaker + automatic fallback)
- **Trigger:** A single-weekend Lapak Gaming outage resulted in **750M IDR GMV loss** and **60M IDR margin loss** due to single point of failure
- **Solution:** Circuit Breaker pattern: system retries with secondary supplier (Vexa) if primary returns "System Busy"
- **Product logic:** P0 delivery priority — classified as critical infrastructure improvement
- **PRD:** `PRD_New_Supply_Onboarding_Vexa.md`

---

**[ACH-021] E-wallet Routing Optimization — Saved ~90-100M IDR/month**
`[Tags: cost-savings, payments, platform, measurable-impact]`

- **What:** Saved approximately 90-100 million IDR per month by shifting e-wallet payment routing to CIMB
- **Annual equivalent:** ~1.08-1.2 billion IDR (~USD 65,000-72,000) in savings per year
- **How:** Identified more favorable processing rates via CIMB routing vs. existing e-wallet routing
- **Source:** Referenced in `Q1_2026_Gogogo_Product_Deep_Dive_V2.md`

---

**[ACH-022] Gogogo Product Availability UX — Targeting 80% Support Ticket Reduction**
`[Tags: UX, user-experience, support-deflection, product]`

- **What:** Designed product availability UX improvements — gray-out logic for unavailable products, 200 OK product detail pages with real-time supply alerts, replacing 404 errors with informative maintenance banners
- **Target:** Reduce "Page not found" related support tickets by 80%
- **PRD:** `PRD_Product_Availability_UX.md`

---

**[ACH-023] Gogogo — Domain Migration (gogogo.game → gogogo.com, MY Live)**
`[Tags: SEO, domain-migration, multi-market, strategy]`

- **What:** Led the domain migration strategy for Gogogo from gogogo.game to gogogo.com across multiple regional markets
- **Status at handover:** Malaysia market live; Philippines on hold; full regional rollout in Q2 2026
- **Complexity:** Required managing GA/GTM/Pixel configuration per market, 301 redirect management for SEO preservation, and engineering coordination across multiple teams

---

**[ACH-024] Gogogo — Philippines Market Localization**
`[Tags: localization, multi-market, UX, growth]`

- **What:** Localized communication and search behavior for the Philippines market
- **Taglish support:** Implemented Filipino-language (Taglish) search tags for high-growth titles
- **Campaign results:** LOVEGOGOGO campaign showed high engagement — simpler, social-driven mechanics (Facebook-integrated) resonated better than complex gamification
- **Insight:** 80% of Monthly Transacting Users in PH are organic/social-driven — informed subsequent UX strategy decisions
- **Layout optimization:** Improved mobile layout for high-growth titles: Mobile Legends, Blood Strike in PH

---

**[ACH-025] Gogogo — Shield SDK Fraud Risk Integration**
`[Tags: fraud, risk, security, platform]`

- **What:** Implemented Shield SDK in web for transaction risk checking
- **Business context:** Professionalizing the risk/fraud layer to prevent manual deactivations and "on-hold" states for suspicious but legitimate transactions
- **Kafka streaming:** Initial Kafka streaming setup for transaction monitoring

---

**[ACH-026] Gogogo — Multi-Product PRD Pipeline**
`[Tags: PRD-writing, product, gaming, platform]`

PRDs authored and delivered for Gogogo:
- `PRD_Account_Linking_gogogo_Flip.md` — Native Unified Authentication (Flip ID), eliminating the Identity Bridge in favor of native Flip OTP APIs
- `PRD_Display_Social_Proof.md` — Social proof of purchase display
- `PRD_New_Supply_Onboarding_Vexa.md` — Multi-supply failover
- `PRD_Product_Availability_UX.md` — 404 erasure + supply availability UX
- `PRD_Voucher_Improvements.md` — BKK Self-Serve label management, competing voucher logic
- `PRD_Gogogo_Refund_OTP_Flow.md` — Refund flow with OTP verification
- `PRD_Steam_Game.md` — Steam game top-up expansion
- `gogogo_flip_integration_strategy.md` — Full integration strategy document for Gogogo × Flip ecosystem

---

**[ACH-027] Gogogo — RE9 Pre-Order Flow (Delivered Feb 26, 2026)**
`[Tags: product-delivery, gaming, e-commerce]`

- **What:** Designed and delivered a custom pre-order module for Resident Evil 9 game keys
- **Delivery:** Feb 26, 2026 (on schedule)
- **Significance:** First time Gogogo supported a pre-order model for a major game title — proved the team could build custom commerce flows for specific game launches

---

**[ACH-028] Gogogo — BKK Self-Serve Label Management**
`[Tags: self-serve, ops-efficiency, platform]`

- **What:** Designed and shipped a feature enabling the Business Development team to manage "Diskon" (discount) labels and SKU stickers on product pages without engineering intervention
- **Before:** Every label change required a development ticket and engineering deployment
- **After:** BD team fully autonomous for label management

---

<a name="flip-ai-integration"></a>
### AI Integration for Product Team

---

**[ACH-029] AI-Powered Daily Update Workflow — 30-45 min/day saved**
`[Tags: AI-tools, workflow-automation, productivity, proof-of-concept]`

- **What:** Built and operationalized a `/daily-update` workflow that scans file changes, reviews Slack messages across all relevant channels, syncs all project backlogs, updates the central dashboard, and generates a prioritized daily briefing
- **Time saved:** ~30-45 minutes per day for the PM doing manual morning routine
- **Status:** Fully operational (running in Brian's own workflow as proof of concept)
- **Tools integrated:** Google Drive, Slack, ClickUp

---

**[ACH-030] AI Integration Proposal for Flip Product Team**
`[Tags: AI-strategy, leadership, proposal, team-development]`

- **What:** Authored and presented a full AI Integration Plan for Flip's Product & Design team to SVP of Product
- **Date:** February 10, 2026
- **Core proposition:** Multiply team output without increasing headcount by automating repetitive PM work
- **Already live (PoC):** Google Drive connector, Slack connector, ClickUp connector, Daily Update workflow, Action Item extraction, Inbox organization
- **Phase 1 scope:** Research Intelligence Layer — centralized Research Library with AI-queryable access
- **Phase 2 scope:** PM Workflow Automation — Morning Briefing, PRD Writing & Review, Meeting Prep, Post-Meeting Action Items, Sprint/Backlog Grooming, Stakeholder Updates

**Projected ROI stated in proposal:**

| Workflow | Before | After | Improvement |
|----------|--------|-------|-------------|
| Morning standup prep | 30-45 min/day | 5 min/day | ~85% reduction |
| PRD first draft | 4-6 hours | 1-2 hours | ~65% reduction |
| Weekly status reporting | 2-3 hours/week | 15-30 min/week | ~85% reduction |
| Research retrieval | 15-30 min/search | < 1 min/query | ~95% reduction |
| Meeting follow-up + task creation | 20-30 min/meeting | 5 min/meeting | ~80% reduction |

---

**[ACH-031] AI Action Item Extraction from Meetings**
`[Tags: AI-tools, workflow-automation, productivity]`

- **What:** Built and used an AI pipeline that takes meeting notes and automatically: extracts all action items, files them into the correct project backlog, creates ClickUp tasks, and notifies owners
- **Time saved:** 15-20 minutes per meeting (manual follow-up eliminated)
- **Status:** Operational in Brian's workflow; proposed for team-wide rollout

---

**[ACH-032] AI-Powered QA Testing Pipeline**
`[Tags: AI-tools, QA, automation, browser-automation]`

- **What:** Prototyped browser-based AI testing of product flows (specifically for marketplace QA)
- **Significance:** Ahead of its time within the Flip/Gogogo context — AI-driven QA reduces reliance on manual regression testing

---

<a name="flip-leadership"></a>
### Multi-Product Leadership & Operations at Flip

---

**[ACH-033] Multi-Product Scope — 3 Direct + 2 Oversight Teams**
`[Tags: leadership, scope, multi-product, org-design]`

- **What:** Managed 3 directly-owned teams + oversaw 2 additional teams simultaneously
  1. **Payment Platform** (direct) — Core money movement, reconciliation, bank integrations
  2. **Ops Platform** (direct) — Automation, tooling, agent workspace
  3. **Gogogo Ecosystem** (direct) — Gaming top-up, multi-market growth
  4. **Travel Pod / Safaraya** (oversight) — Umrah Visa self-service, eSIM
  5. **Flip Visa** (oversight) — POC for Flip Visa card
- **Context:** Started as single-team ownership; expanded progressively without proportional headcount increase

---

**[ACH-034] Safaraya Umrah Visa Self-Service — PRD authored**
`[Tags: product, travel, self-serve, PRD-writing]`

- **What:** Authored PRD for Safaraya Umrah Visa self-service — a flow enabling users to register for Umrah visas autonomously, without relying on Safaraya's manual fulfillment team
- **Problem solved:** Manual fulfillment bottlenecks for Safaraya visa processing
- **PRD:** `PRD_Safaraya_Umrah_Visa_Self_Service.md`
- **Scope:** Magic link flow up to submission (self-serve visa registration), parity check with design

---

**[ACH-035] Flip Visa POC Kickoff**
`[Tags: new-product, fintech, payments, strategy]`

- **What:** Kicked off the Proof of Concept for Flip Visa card product
- **Actions taken:** Initiated subdomain provisioning (`visa.flip.id`), secured legal approval referencing Safaraya precedent, requested procurement of Flip Visa phone number for WhatsApp

---

**[ACH-036] Knowledge Transfer Documentation — Full Coverage**
`[Tags: documentation, leadership, knowledge-management]`

- **What:** Produced comprehensive Knowledge Transfer (KT) documentation across all owned areas as part of planned transition
- **KT sessions proposed:** 6 structured sessions covering Payment Platform, Ops Platform, stakeholder maps, ongoing initiatives, vendor dependencies, and lessons learned
- **Materials produced:** Transition documents, handover inventory, tactical handover logs, PRD repositories, stakeholder maps with Slack channel IDs

---

**[ACH-037] Internship Program — 3 Interns**
`[Tags: leadership, mentoring, team-building, HR]`

- **What:** Ran an internship program with 3 interns (Alyssya, Ramza, Azis) complete with formal agreements, NDAs, and code of conduct
- **Deliverables produced:** Internship NDA template, 3 individual internship agreements, internship certificate template, code of conduct

---

**[ACH-038] Succession Planning and Org Design Recommendation**
`[Tags: org-design, leadership, strategy]`

- **What:** Produced a structured recommendation for Flip on how to replace a senior generalist PM with a more efficient structure
- **Recommendation:** 2-3 execution-focused junior/mid PMs (Payment, Ops, coordination) rather than one expensive senior PM — cost-effective, focused execution, lower single-point-of-failure risk

---

**[ACH-039] Flip Operations Q2 2026 Roadmap**
`[Tags: roadmap, ops, strategy, PRD-writing]`

- **What:** Authored the Q2 2026 Operations Platform Roadmap and the Q2 Ticket Automation Analysis
- **Scope:** Full mapping of 10,000 monthly tickets to automation feasibility; financial ROI model; staffing impact analysis; timeline with >90% automation target
- **Source:** `Q2_2026_Operations_Platform_Roadmap.md`, `Q2_2026_Ops_Automation_Analysis.md`

---

<a name="merit"></a>
## Merit Incentives — Product Director
**Sep 2025 – Present | Loyalty & Engagement Startup (GCC/Saudi Arabia Market)**

Part-time initially (Sep 2025), switched to full-time. Building Ecommerce Solutions and B2C Superapp allowing users to pay for products and services using loyalty point rewards.

**Areas of Responsibility:** Consumer Ecosystem (B2C Superapp), E-Commerce Solutions B2B, Supply Infrastructure, Seller Portal (PIM/MSP), OMS (Order Management System), Strategic Expansion (SEA & Europe), Product Operations, Regulatory Compliance (GCC)

---

**[ACH-040] Seller Portal — Live in Production**
`[Tags: product-delivery, e-commerce, B2B, launch]`

- **What:** Architected and shipped the Seller Portal to production (went live April 2026)
- **Core flows delivered:** Bulk catalog upload as primary seller onboarding flow, product upload flow, digital product synchronization, RBAC (Role-Based Access Control), Sales Reports
- **Legacy sync solved:** Designed the MGC (Merit Global Catalog) legacy sync architecture to unify new portal data with the existing frontend
- **OKR target:** Stock accuracy < 2% OOS (out of stock), QC pass rate ≥ 95%
- **PRDs authored:** `PRD_Seller_Portal_MGC_Legacy_Sync.md`, `BRD_Supplier_Data_Ingestion_API.md`, `PRD_Seller_Payment_Request_Module.md`

---

**[ACH-041] OMS (Order Management System) State Machine Design**
`[Tags: platform, e-commerce, OMS, technical-PM, architecture]`

- **What:** Designed the OMS State Machine with robust legal state transitions and QC exception logic for multi-tenant order fulfillment
- **Scope:** Covers the full order lifecycle from creation through fulfillment, with exception handling for out-of-stock, QC failure, and cancellation scenarios
- **Complexity:** Multi-tenant architecture (multiple sellers, multiple fulfillment partners)

---

**[ACH-042] Play Store Verification and Release — Moyasar Payment + Biometrics**
`[Tags: product-delivery, payments, mobile, launch, GCC]`

- **What:** Spearheaded technical integration for Moyasar payments (Saudi Arabia's primary payment gateway) and biometrics authentication — resulting in successful Play Store verification and release
- **Significance:** Play Store release is a required milestone for any B2C product in the GCC market; Moyasar integration is mandatory for Saudi payments

---

**[ACH-043] Global Market Assessment — SEA and Europe**
`[Tags: strategy, market-expansion, research]`

- **What:** Conducted a market assessment for SEA (Indonesia, Philippines, Vietnam) and Europe as potential expansion markets for Merit's loyalty/commerce platform
- **Output:** Strategic input to drive the global pivot strategy

---

**[ACH-044] Al Fursan Marketplace Integration**
`[Tags: B2B, marketplace, partnerships, Saudi-Arabia]`

- **What:** Led the Al Fursan marketplace integration — a key Saudi retail partner onboarding onto Merit's Ecommerce platform
- **Deliverables:** Source of truth documentation, roadmap discussions with Tintash, handover documentation, operations failure analysis

---

**[ACH-045] Q2–Q4 2026 OKR Framework for Merit**
`[Tags: OKR, strategy, leadership, roadmap]`

- **What:** Designed the structured OKR framework for Merit's Q2–Q4 2026 operating plan
- **Q2 focus:** Launch readiness, Moyasar payment integration, catalog master content standards
- **Q3–Q4 focus:** User retention (M1 ≥ 20%), operational failure rate reduction, Large Tenant scaling
- **KRs defined for two pods:**
  - Brian's pod: App stability, onboarding activation (≥ 60%), tenant engagement
  - Ghaith's pod: Stock accuracy (< 2% OOS), QC pass rate (≥ 95%), logistics fulfillment SLAs

---

**[ACH-046] Hiring Plan — 4 Critical Roles to Scale Merit**
`[Tags: org-design, hiring, leadership]`

- **What:** Proposed and scoped a 4-role hiring plan to unblock product leads from day-to-day execution
  - **Supplier Ops Manager** (Q2): Manage 100 sellers + supply chain continuity
  - **BD/Partnership Manager** (Q2): Acquire 16 Large Tenants, manage commercial pipeline
  - **Junior PM** (Q2): Own Storefront Builder / Seller Portal feature iterations
  - **Customer Success & Growth PM** (Q3): Tenant retention + B2C user acquisition optimization

---

**[ACH-047] Strategic Pivot — SMB to 16 Large Tenants (Loyalty Burn Logic)**
`[Tags: strategy, e-commerce, GTM, business-model]`

- **What:** Re-focused the E-commerce Solutions targeting from SMB segment to 16 specific Large Tenants using Loyalty Burn logic — a pivot directly tied to hitting Fred's December revenue targets
- **Decision impact:** Fundamentally changed the BD pipeline, commercial presentation, and product roadmap priorities for H2 2026

---

**[ACH-048] E-Commerce Commercial Pitch Deck Critique**
`[Tags: communication, strategy, GTM, sales-enablement]`

- **What:** Completed a full strategic critique and rewrite of Merit's E-Commerce commercial presentation
- **Changes made:** Removed internal comments, inverted narrative flow (problem-first), consolidated 4 repetitive "What" slides down to 2
- **Completed:** March 30, 2026

---

**[ACH-049] B2C Superapp — Multiple PRDs and Launch Prep**
`[Tags: product-delivery, B2C, mobile, superapp, payments]`

PRDs authored for Merit B2C:
- `PRD_B2C_Mixed_Payment_Engine_Full.md` — Multi-payment method support (loyalty points + cash)
- `Master_B2C_AppStoreLaunch_Documentation.md`
- `Master_B2C_Checkout_Documentation.md`
- `PRD_B2C_App_Updates.md`
- `NCNP_B2C_Initiative_Proposal.md` — New Customers / New Products initiative

---

**[ACH-050] Salary Negotiation: Full-Time Product Director — $10K–$12K/month package**
`[Tags: career, compensation, negotiation]`

- **Context:** Negotiated transition from part-time consultant ($40/hr, ~$7,040/month equivalent) to full-time Product Director
- **Package proposed:** USD 10,000–12,000/month gross
- **Benchmark positioning:** Regional Tier-1 (Singapore/Indonesian Unicorn standard), not local corporate standard (which would be $3,500–$5,000)
- **Detailed financial analysis produced:** Full PPh 21 gross-up calculation, BPJS deduction modeling, THR accrual, family health insurance for 5 — documented in `Salary_Proposal_Rationale.md` and `salary_negotiation_plan_director.md`

---

<a name="fasset"></a>
## Fasset — Director of Products
**Feb 2023 – Aug 2023 | Blockchain / Crypto Company**

Initiated structuring of product and delivery processes.

---

**[ACH-051] Data Culture — Metrics Coverage 5x Increase**
`[Tags: data-culture, analytics, leadership, measurable-impact]`

- **What:** Built a data-informed culture from scratch — increased metrics coverage by 5x
- **Context:** Fasset had minimal instrumentation and decision-making was largely intuition-driven; transformed to data-backed product decisions

---

**[ACH-052] Release Cadence — Unplanned Releases Reduced by 80%+**
`[Tags: delivery, process-improvement, engineering-partnership, measurable-impact]`

- **What:** Developed and maintained a structured release cadence
- **Outcome:** Reduced unplanned (emergency) releases by 80%+
- **Significance:** Unplanned releases are a proxy for poor planning, technical debt fires, and unstable processes; reducing them signals improved engineering-product alignment

---

**[ACH-053] Delivery Velocity — 2x Increase**
`[Tags: delivery, agile, velocity, measurable-impact]`

- **What:** Increased delivery velocity by 2x
- **How:** Broke down silos through transparency and regular cross-functional communication

---

**[ACH-054] Indonesian Crypto License — Regulatory Support**
`[Tags: compliance, regulatory, crypto, fintech]`

- **What:** Supported product requirements needed to obtain Fasset's Indonesian crypto operating license
- **Scope:** KYC/AML/OTP/Compliance products requirements, ensuring product met OJK (Otoritas Jasa Keuangan) standards

---

<a name="hijra"></a>
## Hijra Group — VP of Products
**Feb 2022 – Feb 2023 | Challenger Bank in Indonesia (Islamic Banking)**

Head of Product at Hijra Bank, directing 5 PMs across 4 product streams.

**Streams:** New user acquisition, Transaction and integration, KYC/Platform/OTP/Identity/Risk/Compliance, Engagement and Retention

---

**[ACH-055] Install-to-Register Conversion — 35% → 59% in 3 months (+24pp)**
`[Tags: growth, conversion, mobile, acquisition, measurable-impact]`

- **What:** Improved Install-to-Register conversion rate from 35% to 59% in 3 months
- **Absolute improvement:** +24 percentage points
- **Relative improvement:** +69% improvement in conversion rate
- **Context:** Critical top-of-funnel metric for a challenger bank — every unregistered install is wasted acquisition spend

---

**[ACH-056] Register-to-Verified Conversion — 30% → 77% in 3 months (+47pp)**
`[Tags: growth, conversion, KYC, onboarding, measurable-impact]`

- **What:** Improved Register-to-Verified conversion rate from 30% to 77% in 3 months
- **Absolute improvement:** +47 percentage points
- **Relative improvement:** +157% improvement in the KYC completion rate
- **Context:** KYC verification is the activation gate for a banking app — completing this flow is required before any transaction can occur

---

**[ACH-057] Transaction Reliability — Maintained at 99%**
`[Tags: reliability, platform, fintech, banking]`

- **What:** Maintained transaction reliability at 99% throughout tenure
- **Significance:** For a challenger bank, transaction reliability is the foundation of user trust — any degradation causes immediate churn

---

**[ACH-058] Verification Speed — 10 minutes → 6 minutes (-40%)**
`[Tags: UX, KYC, speed, onboarding, measurable-impact]`

- **What:** Improved median verification (KYC) completion time from 10 minutes to 6 minutes
- **Improvement:** -40% reduction in time-to-verified
- **Impact:** Directly improved Register-to-Verified conversion (see ACH-056) and user experience during the critical onboarding moment

---

**[ACH-059] MAU Retention — 6.2% → 30% in 3 months (+384%)**
`[Tags: retention, engagement, growth, measurable-impact]`

- **What:** Increased Monthly Active User Retention rate from 6.2% to 30%
- **Absolute improvement:** +23.8 percentage points
- **Relative improvement:** +384% increase in the retention rate
- **Context:** For a neobank, MAU retention is the signal that users are actually transacting and building habits — moving from 6.2% to 30% is a transformational shift

---

**[ACH-060] OKR Setup — Organization-wide with C-suite Alignment**
`[Tags: OKR, leadership, strategy, org-design]`

- **What:** Assisted the Chiefs in setting up OKRs and implementing them across the organization
- **Scope:** Organization-wide OKR framework, including training PMs, aligning to business strategy, and cadence for quarterly reviews

---

**[ACH-061] PM Standards and Skill Systemization**
`[Tags: leadership, mentoring, PM-development, team-building]`

- **What:** Raised the bar for Product Management at Hijra Bank by setting standards and systemizing core PM skill sets
- **Team:** 5 PMs across 4 product streams
- **Scope:** Structured PM onboarding, skill frameworks, PRD quality standards, and regular coaching cadence

---

<a name="tokopedia"></a>
## Tokopedia — Lead Product Manager
**July 2019 – Feb 2022 | Indonesia's Largest E-commerce Platform**

Led a product management team of 3 PMs, 25 software engineers, 5 product designers. High-traffic, high-availability, high-reliability platforms.

**Areas:** Login & Register (new user experience), OTP/Security/Identity/User Profile Management, A/B Testing Platform, User Data Platform, KYC Management, Authorization and Authentication across all Tokopedia family

---

**[ACH-062] Tokopedia–Gojek Account Integration — 250+ People, 3-Month Target in 1 Month**
`[Tags: large-scale-project, cross-company, integration, leadership, measurable-impact]`

- **What:** Led the integration of Tokopedia accounts with Gojek accounts (GoTo merger-era project)
- **Scale:** Led a project involving **250+ people** across both companies
- **Speed:** Achieved the 3-month target in **1 month** (3x faster than planned)
- **Significance:** One of the largest cross-company integration projects in Indonesian tech history — the GoTo merger required unifying user identity across Tokopedia and Gojek ecosystems

---

**[ACH-063] Centralized Authorization Platform — 1.5M Additional Monthly Transactions**
`[Tags: platform, authorization, identity, measurable-impact, technical-PM]`

- **What:** Centralized Tokopedia's Authorization Platform to unify authentication across the entire Tokopedia family of products
- **Outcome:** Enabled **1.5 million additional monthly transactions** by removing friction from the auth flow
- **Scale:** Coordinated with **50+ collaborators** across engineering and product teams
- **Scope:** Authentication and authorization for all Tokopedia products (Tokopedia, GoTo, and associated services)

---

**[ACH-064] Security Initiative — 12-Month Target Achieved in 3 Months**
`[Tags: security, platform, measurable-impact, delivery]`

- **What:** Achieved the 12-month security improvement target in 3 months (4x faster than planned)
- **Method:** Creative solution with broad buy-in — built a cross-functional alignment approach that accelerated execution
- **Context:** Security initiatives at scale require coordination across many teams; completing in 3 months rather than 12 required both technical creativity and organizational influence

---

**[ACH-065] OTP Cost Reduction — ~USD 2 Million/Year**
`[Tags: cost-savings, platform, security, measurable-impact]`

- **What:** Reduced Tokopedia's yearly OTP (One-Time Password) cost by approximately USD 2 million
- **While improving:** Authentication success rate also improved simultaneously (not just cost-cut)
- **How:** Likely involved routing optimization, retry logic improvements, and OTP provider strategy (specifics in institutional knowledge)
- **Scale context:** Tokopedia at this time was handling hundreds of millions of OTPs per year across all products

---

**[ACH-066] Talent Development — Multiple Direct Reports Promoted to Managers**
`[Tags: leadership, mentoring, talent-development]`

- **What:** Consistently promoted direct reports from Individual Contributor (IC) roles to Manager-level roles
- **Context:** At Tokopedia, building a talent pipeline that can step into leadership roles is a key PM Lead metric
- **Awards:** Received internal "Growth Mindset & Focus on Consumers" awards in 2021 from Tokopedia

---

**[ACH-067] Team Leadership — 3 PMs + 25 Engineers + 5 Designers**
`[Tags: leadership, team-building, cross-functional]`

- **What:** Led a cross-functional product team comprising 3 Product Managers, 25 Software Engineers, and 5 Product Designers
- **Domain:** High-traffic, high-availability, high-reliability platforms (authentication, identity, security)

---

<a name="glints"></a>
## Glints — Product Manager
**June 2018 – June 2019 | Job Marketplace for Young Talents across SEA**

First PM at Glints. Reported to founders, worked with digital marketing and distributed teams across SEA and Taiwan.

---

**[ACH-068] First PM Hire — Set Up PM Culture from Zero**
`[Tags: 0-to-1, PM-culture, leadership, startup]`

- **What:** Was the first Product Manager hired at Glints
- **Scope:** Set up PM culture and cadence from scratch; mentored 2 junior PMs; managed end-to-end Job Marketplace (candidate acquisition to successful application, employer job creation to candidate matching)

---

**[ACH-069] Shortlisted Applications per Job Post — +522% in 3 Months**
`[Tags: marketplace, growth, measurable-impact, matching]`

- **What:** Improved the average number of shortlisted applications per job post by 522% in 3 months
- **Significance:** Shortlisted applications (quality signal) went up by more than 5x — showing improved candidate-job matching quality

---

**[ACH-070] Applications per Job Post — +234% in 3 Months**
`[Tags: marketplace, growth, measurable-impact, acquisition]`

- **What:** Increased applications per job post by 234% in 3 months

---

**[ACH-071] Total Platform Applications — +571% in 3 Months**
`[Tags: marketplace, growth, measurable-impact, acquisition]`

- **What:** Increased total applications across the platform by 571% in 3 months
- **Note:** Achieved together with Digital Marketing team — product and distribution worked in concert to drive this growth

---

<a name="kitabisa"></a>
## Kitabisa — Product Manager
**April 2018 – June 2018 | Crowdfunding Platform**

One of the first three PM hires. Responsible for Zakat products targeting Muslims in Indonesia.

---

**[ACH-072] Zakat GDV — 549% of Monthly Baseline in 2 Months**
`[Tags: growth, social-impact, fintech, measurable-impact, religious-tech]`

- **What:** Within two months of joining, the Gross Donation Value (GDV) of Zakat products rose to 549% of the normal monthly baseline
- **Context:** Zakat is the Islamic tithe — a large market in Indonesia (world's largest Muslim-majority country)

---

**[ACH-073] Zakat GDV — 288% Year-on-Year Increase**
`[Tags: growth, social-impact, fintech, measurable-impact]`

- **What:** Achieved a 288% year-on-year increase in Zakat product GDV

---

**[ACH-074] Ramadan GDV — Doubled the Increment vs Prior Year**
`[Tags: growth, seasonal, social-impact, fintech, measurable-impact]`

- **What:** Doubled the Ramadan GDV increment compared to the prior year
- **Notable:** Achieved with only one month of preparation — demonstrated speed-to-impact

---

<a name="founder"></a>
## Founder & Head of Product Era
**2006 – 2018 | Multiple Ventures**

---

**[ACH-075] Web and App Services Company — Founder**
`[Tags: entrepreneurship, 0-to-1, founder, technology]`

- **Duration:** Multiple years within 2006–2018 period
- **What:** Founded and operated a web and app services company

---

**[ACH-076] Seed-Funded Startup — B2B E-commerce**
`[Tags: entrepreneurship, 0-to-1, fundraising, B2B, e-commerce]`

- **What:** Founded and ran a seed-funded startup in the B2B e-commerce space
- **Notable:** Raised external seed funding (specific amount in institutional knowledge)

---

**[ACH-077] B2B Restaurant Delivery App — Head of Product (3 years)**
`[Tags: product-leadership, 0-to-1, food-tech, B2B]`

- **What:** Served as Head of Product for a B2B restaurant delivery app for 3 years

---

<a name="awards"></a>
## Awards & Recognition

---

**[ACH-078] 1st Winner — Wirausaha Muda Mandiri 2009 (Bank Mandiri)**
`[Tags: award, entrepreneurship, early-career]`

- One of Indonesia's most prestigious young entrepreneur competitions, sponsored by Bank Mandiri

---

**[ACH-079] iMulai 3.0 Winner — USAID & Microsoft**
`[Tags: award, entrepreneurship, international]`

- iMulai is a startup program co-sponsored by USAID and Microsoft for Indonesian entrepreneurs

---

**[ACH-080] iMulai 4.0 Winner — USAID & Microsoft**
`[Tags: award, entrepreneurship, international]`

- Second consecutive win in the iMulai program (two different cohorts)

---

**[ACH-081] Top 8 Startup — INAICTA 2012 (Indonesian Government)**
`[Tags: award, technology, government-recognition]`

- INAICTA (Indonesia ICT Awards) is the national government technology innovation award

---

**[ACH-082] Merit Award — INAICTA 2013 (Indonesian Government)**
`[Tags: award, technology, government-recognition]`

- Second consecutive recognition at INAICTA (back-to-back years: 2012 Top 8, 2013 Merit Award)

---

**[ACH-083] Best Utility Mobile Application 2013 — BUBU Awards V.08**
`[Tags: award, mobile, product-design]`

- BUBU Awards is Indonesia's premier digital industry award

---

**[ACH-084] 2nd Best Graduate — Jakarta Founder Institute, 3rd Batch 2013**
`[Tags: award, entrepreneurship, education]`

- Founder Institute is the world's largest pre-seed accelerator; ranked 2nd of entire cohort

---

**[ACH-085] 2nd Place Startup — AICTA 2014 (ASEAN ICT Awards)**
`[Tags: award, technology, ASEAN, international]`

- AICTA is the ASEAN-level technology award — representing Indonesia at the regional level and placing 2nd across Southeast Asia

---

**[ACH-086] Growth Mindset & Focus on Consumers Awards 2021 — Tokopedia**
`[Tags: award, internal-recognition, growth, customer-centricity]`

- Internal Tokopedia award recognizing product leaders who demonstrate growth mindset and consumer focus in a team of thousands

---

## Quick Reference: Key Numbers

| Metric | Achievement | Company | Period |
|--------|-------------|---------|--------|
| Money Transfer cost | -32% → USD 2.12M/year saved | Flip | 2024-2025 |
| Cost reduction vs target | 450% of target achieved | Flip | 2024-2025 |
| Out-of-SLA transfers | -59% | Flip | 2024-2025 |
| Customer support cost | -42% → ~USD 200K saved in 7 months | Flip | 2024-2025 |
| Refund automation coverage | ~90%, zero false positives | Flip | 2024-2025 |
| Ticket automation | 0% → 70% of 10K/month | Flip | 2024-2026 |
| Fallback complaint reduction | -26.8% via GenAI | Flip | 2024-2025 |
| Gogogo Inquiry Success Rate | 40% → 86% | Flip/Gogogo | Q1 2026 |
| E-wallet savings | 90-100M IDR/month | Flip/Gogogo | 2025 |
| Vexa failover protection | 750M IDR GMV / 60M margin per outage | Flip/Gogogo | 2026 |
| FINA AI cost per turn | ~$0.004 (Claude 3 Haiku) | Flip/FINA | 2026 |
| FINA target deflection | >60% post-rollout | Flip/FINA | 2026 |
| MAU Retention | 6.2% → 30% (+384%) | Hijra | 2022 |
| Install-to-Register | 35% → 59% (+69%) | Hijra | 2022 |
| Register-to-Verified | 30% → 77% (+157%) | Hijra | 2022 |
| Verification time | 10 min → 6 min (-40%) | Hijra | 2022 |
| GoTo integration speed | 3-month target in 1 month | Tokopedia | 2020-2021 |
| Additional monthly transactions | +1.5M via Auth Platform | Tokopedia | 2019-2022 |
| OTP cost savings | ~USD 2M/year | Tokopedia | 2019-2022 |
| Security target speed | 12-month target in 3 months | Tokopedia | 2019-2022 |
| Platform applications growth | +571% in 3 months | Glints | 2018-2019 |
| Shortlisted applications/post | +522% in 3 months | Glints | 2018-2019 |
| Zakat GDV | 549% of monthly baseline | Kitabisa | 2018 |
| Zakat YoY growth | +288% | Kitabisa | 2018 |
| Metrics coverage | 5x increase | Fasset | 2023 |
| Unplanned releases | -80%+ | Fasset | 2023 |
| Delivery velocity | 2x increase | Fasset | 2023 |

---

*Repository compiled from: cv.md, Product Second Brain (WSL) — includes Q1/Q2 Gogogo Learnings, Q1 Deep Dive V2, FINA Phase 0 Progress Report, FINA Phase 1 PRD, FINA Next Phase Plan, Q2 Ops Automation Analysis, Q2 Ops Platform Roadmap, Refund Automation PRD (50M), AI Integration Proposal, Flip Handover Inventory, Exit Talking Points, Salary Proposal documents, Weekly Reports, and all PRDs in Clients/Flip/. Merit client context from Dashboard Summaries and cv.md.*
