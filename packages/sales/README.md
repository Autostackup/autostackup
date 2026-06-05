# @autostackup/sales

> **Turn Claude into a senior sales strategist.** Qualify leads with BANT + MEDDIC, score ICP fit, track your pipeline with weighted forecasting, and generate personalized outreach — all from a conversation with Claude.

[![npm version](https://img.shields.io/npm/v/@autostackup/sales)](https://www.npmjs.com/package/@autostackup/sales)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the **[Autostackup MCP Suite](https://www.npmjs.com/~autostackup)** — the AI operating system for founders.

---

## Install

```json
{
  "mcpServers": {
    "autostackup-sales": {
      "command": "npx",
      "args": ["-y", "@autostackup/sales"],
      "env": {
        "HUNTER_API_KEY": "optional",
        "APOLLO_API_KEY": "optional"
      }
    }
  }
}
```

Add to your Claude Desktop config and restart. All 5 tools are immediately available.

---

## Tools

### `qualify_lead`
**Dual BANT + MEDDIC lead qualification with tier, gaps, and next step**

Runs two of the most proven sales qualification frameworks simultaneously. BANT (Budget, Authority, Need, Timeline) gives you the quick filter. MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identified Pain, Champion) gives you the deeper read on deal complexity. Combined, they produce a score, a tier (A/B/C/D), and a specific recommended action.

**Returns:** Overall score, BANT score, MEDDIC score, tier, strengths list, gaps list, recommended next step.

**Try it:** *"Qualify this lead: [company, decision maker title, pain point, budget, timeline]"*

---

### `score_icp`
**Ideal Customer Profile fit scoring with auto-disqualification**

Define your ICP once — target industries, company sizes, decision maker titles, geographies, and any must-have attributes. Then score any prospect against it. Deals that fail a must-have get disqualified immediately so your team doesn't waste time. Deals that fit get a score and tier so you know who to prioritize.

**Returns:** Fit score (0–100), tier (A/B/C/DQ), dimension-by-dimension breakdown, disqualification reasons, prioritization recommendation.

**Try it:** *"Score this prospect against my ICP: [describe your ICP], prospect is [company details and contact title]"*

---

### `track_pipeline`
**Weighted pipeline forecast + stale deal and at-risk detection**

Paste in your deals and get a real forecast — not just stage counts, but weighted values based on close probability. Every deal gets analyzed for staleness (no activity 14+ days) and risk (closing soon but low probability). The output is an urgent actions list so you know exactly what to do this week.

**Returns:** Weighted forecast, total pipeline value, win rate, stage breakdown table, stale deal flags, at-risk deal flags, urgent action items.

**Try it:** *"Track my pipeline: [list deals with name, stage, value, last activity date, expected close date]"*

---

### `generate_outreach`
**Personalized email / LinkedIn / SMS copy with subject variants and follow-up**

Generates multi-channel outreach built around your value proposition and the prospect's specific pain point. Every output includes 4 subject line variants to A/B test, the main body copy, a follow-up message, and a LinkedIn connection note. Tone options: formal, conversational, or bold.

**Returns:** 4 subject line options, body copy, follow-up email, LinkedIn note (if channel is LinkedIn), channel-specific tips, word count.

**Try it:** *"Write a cold email to [name, title, company, industry]. We solve [pain point] with [value prop]. Conversational tone, CTA is a 15-min call."*

---

### `enrich_lead`
**Live contact and company enrichment via Hunter.io or Apollo.io**

Fetches verified email addresses, phone numbers, job titles, and company data for any contact or domain. Choose Hunter.io for domain-level email discovery and verification, or Apollo.io for full contact matching including LinkedIn profiles and firmographics.

**Requires:** `HUNTER_API_KEY` or `APOLLO_API_KEY` in your MCP environment config.

**Try it:** *"Enrich the contact at acme.com using Hunter"* or *"Find contact data for John Smith, CTO at Acme Corp using Apollo"*

---

## No API Keys Needed for Most Tools

`qualify_lead`, `score_icp`, `track_pipeline`, and `generate_outreach` run entirely on Claude — no external keys required. Only `enrich_lead` needs a key, and it's optional.

---

## Part of the Autostackup Suite

| Package | Description |
|---------|-------------|
| **@autostackup/sales** | ← You are here |
| [@autostackup/marketing](https://www.npmjs.com/package/@autostackup/marketing) | Kotler analysis, IMC planning, audience segmentation |
| @autostackup/hr | 🔜 Recruitment, onboarding, offers |
| @autostackup/founder | 🔜 Full orchestrator |

## License

MIT
