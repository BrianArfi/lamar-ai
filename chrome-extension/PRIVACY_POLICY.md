# Privacy Policy for Career-Ops AI Co-Pilot

**Last Updated: June 4, 2026**

This Privacy Policy describes how the Career-Ops AI Co-Pilot Chrome Extension ("the Extension") collects, uses, and protects your data.

## 1. Local & Offline Processing
The Extension is built with a security-first, client-side architectural paradigm.
- **Job Description Extraction**: All DOM elements and job details extracted from supported portals (LinkedIn, Indeed, Glints, etc.) are processed locally in your active tab session.
- **Profile Synchronization**: Prefilled query parameters are sent securely as URL parameters directly to your local sandbox dashboard (`http://localhost:3000` or your configured SaaS host) when you explicitly click "Tailor CV & Track This Job".
- **Form Auto-Filling**: The detected form fields are sent to the local Next.js server `/api/autofill-form` endpoint using your secure Sync Token. All data is processed securely through your own OpenAI credentials.

## 2. Permissions & Scope
The Extension requests the following permissions:
- `activeTab`: Used strictly to access the DOM of the tab you are currently viewing when you explicitly trigger the Extension action.
- `storage`: Used to securely cache session settings locally inside your browser sandbox.
- `host_permissions`: Scoped to supported job platform domains (LinkedIn, Glints, Indeed, Kalibrr, JobStreet, Greenhouse, and Lever) to safely inject the content parser.

## 3. Data Sharing
We do **NOT** host background analytics, tracker beacons, or third-party advertising scripts.
- No personal identity data (name, email, location) is collected or processed by the Extension itself.
- We do not sell, rent, or distribute any user information.

## 4. Updates
This Privacy Policy may be updated from time to time. We encourage users to check this page periodically for changes.

For support or questions, contact us at `support@career-ops.com`.
