# @autostackup/marketing

> **Give Claude the strategic frameworks that marketing consultants charge thousands for.** Audit your marketing mix with Kotler's 9-element framework, build a full IMC campaign across Meta and Google, and map your audience with a persona matrix — all in a single conversation.

[![npm version](https://img.shields.io/npm/v/@autostackup/marketing)](https://www.npmjs.com/package/@autostackup/marketing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the **[Autostackup MCP Suite](https://www.npmjs.com/~autostackup)** — the AI operating system for founders.

---

## Install

```json
{
  "mcpServers": {
    "autostackup-marketing": {
      "command": "npx",
      "args": ["-y", "@autostackup/marketing"]
    }
  }
}
```

Add to your Claude Desktop config and restart. No API keys required — all three tools run entirely on Claude.

---

## Tools

### `kotler_analysis`
**Philip Kotler's 9-element marketing mix audit — scored and prioritized**

Kotler's marketing mix is the most comprehensive framework for diagnosing why a company's go-to-market is or isn't working. This tool runs a structured audit across all 9 elements, scores each one, identifies your biggest gaps, and tells you exactly what to fix first.

**The 9 elements:**

| # | Element | What gets evaluated |
|---|---------|-------------------|
| 1 | **Product** | Differentiation, feature depth, product-market fit evidence |
| 2 | **Price** | Value-based vs. cost-plus pricing, price point definition, tiering strategy |
| 3 | **Place** | Channel count and mix, digital presence, channel conflict risk |
| 4 | **Promotion** | Active channels, message consistency, editorial strategy |
| 5 | **People** | Sales, support, and customer success structure and training |
| 6 | **Process** | Customer delivery documentation, SLAs, friction points |
| 7 | **Physical Evidence** | Reviews, testimonials, website quality, packaging, brand tangibles |
| 8 | **Positioning** | Target customer clarity, differentiation statement, competitive framing |
| 9 | **Performance** | KPI tracking, revenue-connected metrics, reporting cadence |

**Returns:** Score per element (0–100), overall score and rating (Strong / Developing / Needs Work), strengths list, gaps list, top 3 priority actions ranked by urgency, strategic summary for board or investor use.

**Try it:**
> *"Run a Kotler analysis on my company. We sell [product] to [market]. Our pricing is [X], we sell through [channels], we promote via [methods], our team is [structure], delivery works like [process], our proof points are [evidence], we position as [positioning], and we track [metrics]."*

---

### `plan_imc_campaign`
**Full Integrated Marketing Communications plan across Meta, Google, email, and content**

Building a campaign that works across multiple channels requires strategy at every layer — the right objective, the right budget split, the right audience targeting, the right creative formats, and a launch checklist so nothing gets missed. This tool generates all of it.

**Budget allocation** is driven by your objective:
- **Awareness** → Heavier on Meta reach, YouTube, influencer
- **Consideration** → Balanced Meta + Google Search
- **Conversion** → Heavier on Google Search + Performance Max + retargeting
- **Retention** → Heavier on email + social remarketing
- **Reactivation** → Email-first + paid support

**Meta (Facebook / Instagram) plan includes:**
- Campaign objective mapped to Meta's ad buying types
- Full-funnel structure with TOFU / MOFU / BOFU budget splits
- Cold audience targeting (Lookalike 1%, Lookalike 5%, interest stacks)
- Warm retargeting windows (video viewers, page engagers, website visitors)
- Ad format recommendations per objective (Reels, carousels, collection, lead forms)
- 4 copy angles to A/B test (problem-led, social proof, curiosity, direct offer)
- A week-by-week testing and scaling protocol

**Google Ads plan includes:**
- Campaign types by objective (Search, Display, Performance Max, YouTube)
- Keyword strategy with match type guidance
- Negative keyword list pre-built
- Responsive Search Ad copy (15 headlines, 4 descriptions)
- All recommended extensions (sitelinks, callouts, snippets, lead forms, call)

**Email plan** (optional):
- Sequence length, email count, and cadence
- Email-by-email breakdown with subject focus and goal
- KPI targets (open rate, CTR, unsubscribe rate)

**Content plan** (optional):
- 4 content pillar topics
- Content types and publishing cadence
- SEO keyword intent guidance

**Plus:**
- Week-by-week campaign timeline
- KPIs tied to your objective (not vanity metrics)
- Full creative needs list with exact ad dimensions and specs
- Launch checklist: pixel verification, UTM setup, account approvals, brand safety

**Returns:** Budget allocation table, Meta plan, Google plan, email/content plans, timeline, KPIs, creative brief, launch checklist.

**Try it:**
> *"Plan an IMC campaign for [product]. Target audience: [description]. Objective: conversion. Budget: $20,000. Duration: 8 weeks. Channels: Meta and Google. Key message: [your message]."*

---

### `segment_audience`
**Audience segmentation with persona map, messaging matrix, and channel recommendations**

Before spending on ads or content, you need to know exactly who you're talking to — not just demographics, but what they care about, what triggers them to buy, and which channel actually reaches them. This tool builds a prioritized segment map with a messaging matrix so every dollar targets the right person with the right message.

**What it builds:**

**Segment map (3–4 segments):**
- Segment name and priority order (who to go after first)
- Characteristics of each segment
- Pain points specific to each segment
- Buying triggers — what causes them to act
- Estimated market size and conversion rate notes

**Persona detail per segment:**
- Messaging approach (problem-led, proof-led, or value-led)
- Where they are in the awareness spectrum
- What objections they typically raise

**Messaging matrix:**
- Headline tailored to each segment
- Sub-headline addressing their specific pain
- Call-to-action calibrated to their buying readiness
- What proof format works best (quote, stat, logo, case study)

**Channel recommendations:**
- Top 3 channels for your B2B, B2C, or both business model
- Content strategy per channel type
- Community play (LinkedIn groups, Discord, WhatsApp, events)

**Returns:** Prioritized segments, persona details, messaging matrix table, channel recommendations, community strategy.

**Try it:**
> *"Segment the audience for my [product]. I solve [problem] for [industry]. My B2B/B2C model targets [geography]. Existing customers look like [description]."*

---

## No API Keys Required

All three tools run entirely on Claude's reasoning. No external services, no API bills, no setup beyond adding the MCP to your config.

---

## Part of the Autostackup Suite

| Package | Description |
|---------|-------------|
| [@autostackup/sales](https://www.npmjs.com/package/@autostackup/sales) | Lead qualification, pipeline tracking, outreach generation |
| **@autostackup/marketing** | ← You are here |
| @autostackup/hr | 🔜 Recruitment, onboarding, offer letters |
| @autostackup/founder | 🔜 Full orchestrator: concept → plan → launch |

---

## Works Best Alongside

| Need | Companion MCP |
|------|--------------|
| Meta Ads execution | [mikusnuz/meta-ads-mcp](https://github.com/mikusnuz/meta-ads-mcp) — 135 tools |
| Google Analytics data | [ruchernchong/mcp-server-google-analytics](https://github.com/ruchernchong/mcp-server-google-analytics) |

Autostackup handles the strategy. These handle the execution.

---

## License

MIT
