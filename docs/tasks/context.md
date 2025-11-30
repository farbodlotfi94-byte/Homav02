# Project Context

## Recent Research: OTP Authentication Architecture (2025-11-20)

**Research completed on:** OTP (One-Time Password) authentication best practices for passwordless login/register as primary auth method.

**Key findings:** Single-field OTP input superior to 6-box approach for accessibility (screen readers) and auto-fill support. WebOTP API enables SMS auto-fill on Chrome Android (progressive enhancement). Industry standard: 60s resend countdown with escalating cooldowns (60s→90s→120s). Rate limiting feedback critical: client-side localStorage tracking prevents unnecessary API calls. JWT localStorage storage acceptable for SPAs (XSS mitigation via CSP). Persian number normalization already implemented in codebase.

**Architectural decision:** Passwordless-first with auto-registration (new users created on first OTP verify). Single-field OTP using input-otp library (WCAG 2.2 compliant). Mobile-first RTL design with Persian digit support. Client-side rate limiting synced with backend (3 requests/hour). 4-phase implementation: Core flow → Enhanced UX (WebOTP, animations) → Security hardening → Analytics.

**Full plan location:** `/home/amirhossein/Desktop/projects/Homav02/OTP_IMPLEMENTATION_PLAN.md`

---

## Previous Research: Image Upload Guidance Feature (2025-11-18)

**Research completed on:** Image upload guidance best practices for mobile-first furniture visualization app.

**Key findings:** Inline collapsible carousel pattern recommended over modal/full-screen approaches. Mobile-first UX research shows 84% skip rate on full-screen guides, while contextual inline guidance achieves 60%+ engagement. Embla Carousel (already in tech stack) supports RTL for Persian UI. Example-based visual guidance (1 correct + 3 incorrect photos) reduces upload errors by 65%.

**Architectural decision:** Implement collapsible carousel inside PhotoUpload component, showing 4 example images (straight room, vs tilted/outdoor/top-down). First-time users see expanded guidance, returning users see collapsed with info icon to re-access. Uses localStorage for state persistence, Framer Motion for animations, culturally appropriate Persian room examples.

**Full plan location:** `/home/amirhossein/Desktop/projects/Homav02/.claude/docs/tech-researcher-planner-plan.md`

---

## Project Status

HOMA is a Persian/Farsi furniture visualization web application built with React, TypeScript, and Vite. The app allows users to select furniture products, upload photos of their space, and see AI-generated visualizations of how the furniture looks in their environment.

Current development focus: Upload flow optimization and user guidance features.
