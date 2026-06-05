# Autostackup MCP Suite

> **The AI operating system for founders** — plug Claude directly into your sales pipeline, marketing strategy, and business operations. No new apps. No new dashboards. Just ask Claude and get expert-grade output instantly.

[![npm](https://img.shields.io/npm/v/@autostackup/sales)](https://www.npmjs.com/package/@autostackup/sales)
[![npm](https://img.shields.io/npm/v/@autostackup/marketing)](https://www.npmjs.com/package/@autostackup/marketing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is this?

Most MCP servers connect Claude to APIs — they let you *read and write data*. Autostackup does something different: it gives Claude **business intelligence frameworks** — the strategic thinking tools that consultants, growth teams, and sales leaders use every day.

Ask Claude to qualify a lead using BANT and MEDDIC. Ask it to build a full IMC campaign across Meta and Google. Ask it to audit your marketing strategy against Kotler's 9-element framework. It does it — structured, scored, and actionable — in seconds.

---

## Packages

| Package | Install | What it does |
|---------|---------|--------------|
| [`@autostackup/sales`](#autostackupsales) | `npx @autostackup/sales` | Lead qualification, pipeline tracking, ICP scoring, outreach generation |
| [`@autostackup/marketing`](#autostackupmarketing) | `npx @autostackup/marketing` | Kotler 9-element analysis, IMC campaign planning, audience segmentation |
| `@autostackup/hr` | 🔜 Coming soon | Recruitment screening, onboarding protocol, offer generation |
| `@autostackup/research` | 🔜 Coming soon | Trend scanning, competitor intelligence, market sizing |
| `@autostackup/founder` | 🔜 Coming soon | Orchestrator — ties all modules together from idea to launch |

---

## Quick Setup (Claude Desktop)

Add to your Claude Desktop config file:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "autostackup-sales": {
      "command": "npx",
      "args": ["-y", "@autostackup/sales"],
      "env": {
        "HUNTER_API_KEY": "your-hunter-key-optional",
        "APOLLO_API_KEY": "your-apollo-key-optional"
      }
    },
    "autostackup-marketing": {
      "command": "npx",
      "args": ["-y", "@autostackup/marketing"]
    }
  }
}
```

Restart Claude Desktop. Done. Every tool below is now available.

---

## @autostackup/sales

> **Turn Claude into a senior sales strategist.** Qualify leads, score fit, write outreach, and track your pipeline — all from a conversation.

### `qualify_lead` — BANT + MEDDIC Dual Qualification

Most teams use BANT *or* MEDDIC. This tool runs both simultaneously and gives you a combined score, tier, and action plan.

**What it does:**
- Scores your lead on **Budget, Authority, Need, and Timeline** (BANT)
- Cross-validates using **Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, and Champion** (MEDDIC)
- Returns a **tier** (A = close now / B = develop / C = nurture / D = deprioritize)
- Lists specific **strengths** in this deal ("Decision maker is at VP level", "Timeline is defined")
- Lists specific **gaps** ("Budget not established", "Competing against 2 vendors")
- Recommends the **exact next step** ("Schedule executive alignment call and begin proposal draft")

**Example prompt:**
> "Qualify this lead: Acme Corp, 200 employees, SaaS company. Decision maker is the VP of Operations. They need to reduce manual reporting time by 80%. Budget is ~$50k/year. They want to decide by end of quarter."

---

### `score_icp` — Ideal Customer Profile Fit Scoring

Before you spend time on a lead, know if they actually fit. Define your ICP once and score every prospect against it automatically.

**What it does:**
- Takes your **ICP definition** — target industries, company sizes, job titles, geographies, and must-have attributes
- Scores any prospect against each dimension
- Returns a **fit score (0–100)** and tier (A/B/C/DQ)
- **Disqualifies automatically** if must-have criteria aren't met — with clear reasons
- Breaks down exactly which dimensions matched and which didn't

**Example prompt:**
> "Score this prospect against my ICP: we sell to B2B SaaS companies, 50–500 employees, targeting Head of Finance or CFO, in the US or UK. The prospect is a 300-person fintech company in London, contact is the Chief Financial Officer."

---

### `track_pipeline` — Weighted Pipeline Forecast + Risk Detection

See your entire pipeline clearly — not just deal stages, but which deals are going cold, which are at risk of slipping, and what your realistic revenue forecast looks like.

**What it does:**
- Calculates **weighted forecast** (deal value × probability) for each stage
- Detects **stale deals** — any deal with no activity in 14+ days gets flagged
- Flags **at-risk deals** — closing soon but probability is still low
- Marks **overdue deals** — expected close date has passed
- Returns a **stage breakdown** (count + value per stage)
- Generates a **urgent actions list** ("Follow up with Jane at Acme — no activity for 21 days")
- Computes your **win rate** across closed deals

**Example prompt:**
> "Track my pipeline: I have 8 deals — [list them with stage, value, last activity, and expected close date]. Give me the forecast and tell me what needs attention this week."

---

### `generate_outreach` — Personalized Multi-Channel Sales Copy

Stop writing cold emails from scratch. Generate personalized, channel-appropriate outreach in seconds — with multiple subject line options and a follow-up sequence included.

**What it does:**
- Generates outreach for **email, LinkedIn, or SMS**
- Supports three tones: **formal, conversational, or bold**
- Builds the message around your **value proposition and their specific pain point**
- Includes **social proof** if you provide a case study or stat
- Returns **4 subject line variants** to A/B test
- Includes a **follow-up email** pre-written and ready to send
- For LinkedIn: generates a **connection note** (under 300 characters)
- Adds **channel-specific tips** (send times, A/B testing advice, tone guidance)

**Example prompt:**
> "Write a cold email to Sarah Chen, VP of Marketing at GrowthCo (a 150-person B2B SaaS company). We help marketing teams cut campaign reporting time by 70%. Conversational tone, CTA is a 15-min call."

---

### `enrich_lead` — Live Contact & Company Enrichment

Get verified emails, phone numbers, job titles, and company data for any lead — without leaving Claude.

**What it does:**
- Queries **Hunter.io** (domain search or email verification) or **Apollo.io** (contact match)
- Returns verified contact data, company firmographics, and social profiles
- Requires your own API key (BYOK) — your data stays yours

**Requires:** `HUNTER_API_KEY` or `APOLLO_API_KEY` in your MCP config env.

---

## @autostackup/marketing

> **Give Claude the strategic frameworks that marketing consultants charge thousands for.** Kotler's 9-element mix, full IMC campaign planning, and audience segmentation — ready in minutes.

### `kotler_analysis` — 9-Element Marketing Mix Audit

Philip Kotler's marketing mix framework covers every dimension of how a business goes to market. This tool scores your company across all 9 elements and tells you exactly what to fix first.

**The 9 elements scored:**

| Element | What's evaluated |
|---------|-----------------|
| **Product** | Differentiation, feature depth, product-market fit evidence |
| **Price** | Value-based vs. cost-plus, price point definition, tiering |
| **Place** | Channel count, digital presence, channel conflict risk |
| **Promotion** | Active channels, message consistency, content strategy |
| **People** | Sales, support, and customer success structure |
| **Process** | Delivery process documentation, SLA definition |
| **Physical Evidence** | Social proof, reviews, website quality, packaging |
| **Positioning** | Target clarity, differentiation statement, competitive framing |
| **Performance** | KPI tracking, revenue-connected metrics, reporting cadence |

**What you get:**
- A **score (0–100) for each element** with the reasoning behind it
- An **overall score and rating** (Strong / Developing / Needs Work)
- A clear list of **strengths** to protect and **gaps** to close
- **Top 3 priority actions** ranked by urgency
- A **strategic summary** you can use in board presentations or investor updates

**Example prompt:**
> "Run a Kotler analysis on my SaaS company. We sell project management software to construction firms. [Describe your product, pricing, channels, promotions, team, process, evidence, positioning, and KPIs]."

---

### `plan_imc_campaign` — Integrated Marketing Communications Plan

Building a campaign across multiple channels is complex. This tool handles the strategy, budget allocation, channel-specific tactics, creative brief, and launch checklist — all in one output.

**What it does:**

**Budget allocation** — Splits your budget across channels intelligently based on your objective:
- *Awareness* → heavier on Meta reach + YouTube
- *Consideration* → balanced Meta + Google Search
- *Conversion* → heavier on Google Search + Performance Max + retargeting
- *Retention* → heavier on email + remarketing

**Meta (Facebook/Instagram) plan:**
- Campaign objective mapped to Meta's buying types
- Full funnel structure (TOFU/MOFU/BOFU) with budget splits per layer
- Audience recommendations (Lookalike 1%, Lookalike 5%, interest stacks, retargeting windows)
- Ad format recommendations by objective (Reels, carousels, collection, lead forms)
- 4 copy angles to test (problem-led, social proof, curiosity, direct offer)
- Testing protocol (week 1–2 test → week 3–4 optimize → scale)

**Google Ads plan:**
- Campaign types by objective (Search, Display, Performance Max, YouTube)
- Keyword strategy (exact, phrase, broad match with guidance)
- Negative keyword list
- Responsive Search Ad copy structure (15 headlines, 4 descriptions)
- All recommended extensions (sitelinks, callouts, structured snippets, lead forms)

**Email plan** (if enabled):
- Sequence length and cadence
- Email-by-email breakdown with subject focus and conversion goal
- Open rate, CTR, and unsubscribe rate targets

**Content plan** (if enabled):
- Pillar topics for the campaign
- Content types and publishing cadence
- SEO keyword intent guidance

**Plus:**
- **Week-by-week timeline** from setup to scale
- **KPIs** tied to your objective (not vanity metrics)
- **Creative needs list** — exact dimensions and specs for every asset
- **Launch checklist** — pixel verification, UTM setup, brand safety, account approvals

**Example prompt:**
> "Plan an IMC campaign for my SaaS product targeting mid-market HR managers in the US. Objective is conversion. Budget $15,000 over 8 weeks. Use Meta and Google. Key message: cut HR admin time by 50%."

---

### `segment_audience` — Persona Map + Messaging Matrix

Before you spend on ads, know exactly who you're talking to, what they care about, and which channel reaches them best.

**What it does:**
- Builds **3–4 audience segments** based on your product, problem, and existing customers
- For each segment: characteristics, pain points, buying triggers, and estimated market size
- Assigns a **priority order** (who to go after first and why)
- Defines a **messaging approach** per segment (problem-led, proof-led, value-led)
- Builds a **messaging matrix** — headline, subheadline, and CTA tailored for each segment
- Gives **channel recommendations** calibrated for B2B, B2C, or both
- Includes a **community strategy** (LinkedIn groups, Discord, WhatsApp, conferences)

**Example prompt:**
> "Segment the audience for my B2B project management tool for construction companies. I solve the problem of missed deadlines and miscommunication between contractors and clients."

---

## Works Best Alongside These MCPs

Autostackup is the **strategy and intelligence layer**. For data and execution, pair it with these battle-tested tools:

| Need | Recommended MCP |
|------|----------------|
| Live lead search & enrichment | [Inferensys/apollo-io-mcp](https://github.com/Inferensys/apollo-io-mcp) — 27 Apollo.io tools |
| CRM (Pipedrive) | [iamsamuelfraga/mcp-pipedrive](https://github.com/iamsamuelfraga/mcp-pipedrive) — 100+ tools |
| Cold email sequences | [LeadMagic/smartlead-mcp-server](https://github.com/LeadMagic/smartlead-mcp-server) — 113 tools |
| Meta Ads execution | [mikusnuz/meta-ads-mcp](https://github.com/mikusnuz/meta-ads-mcp) — 135 tools |
| Google Analytics | [ruchernchong/mcp-server-google-analytics](https://github.com/ruchernchong/mcp-server-google-analytics) |

---

## Roadmap

```
✅ v0.1  @autostackup/core       — Shared types, response helpers
✅ v0.1  @autostackup/sales      — 5 tools: qualify, score, track, outreach, enrich
✅ v0.1  @autostackup/marketing  — 3 tools: Kotler, IMC, audience
🔜 v0.2  @autostackup/hr         — Recruitment screening, onboarding, offer letters
🔜 v0.3  @autostackup/research   — Trend analysis, competitor scanning, market sizing
🔜 v0.4  @autostackup/legal      — Document review, contract risk, clause extraction
🔜 v1.0  @autostackup/founder    — Full orchestrator: concept → plan → launch
```

---

## API Keys

| Key | Used by | Where to get it |
|-----|---------|----------------|
| `HUNTER_API_KEY` | `enrich_lead` (Hunter mode) | [hunter.io](https://hunter.io) |
| `APOLLO_API_KEY` | `enrich_lead` (Apollo mode) | [apollo.io](https://apollo.io) |

All other tools run entirely on Claude — no external API keys needed.

---

## Contributing

PRs welcome. Each tool lives in its own file under `packages/<module>/src/tools/`. Adding a new tool means:

1. Create `packages/<module>/src/tools/your-tool.ts`
2. Export it from `src/index.ts`
3. Register it in `src/server.ts`
4. Open a PR with a one-line description of what the tool does

---

## License

MIT — free to use, fork, and build on.

---

*Built by [autostackup](https://www.npmjs.com/~autostackup) — the AI operating system for founders.*
