# @autostackup/founder

**The only MCP a founder will ever need.**

One Claude server. Every business function covered — sales, marketing, HR, and three founder-only orchestration tools built for early-stage operators who don't have time for anything else.

## What's inside

### Sales (5 tools)
- **qualify_lead** — BANT + MEDDIC scoring, deal tier, recommended next action
- **enrich_lead** — Contact enrichment via Hunter.io and Apollo.io
- **track_pipeline** — Weighted pipeline forecast, stage health, revenue projection
- **generate_outreach** — Personalized email, LinkedIn, and SMS sequences
- **score_icp** — Ideal Customer Profile fit score with gap analysis

### Marketing (3 tools)
- **kotler_marketing_analysis** — Full 9-element Philip Kotler marketing mix audit
- **imc_campaign_planner** — Integrated campaign with Meta + Google budget allocation
- **audience_segmentation** — Segment your market with messaging matrix per segment

### HR (5 tools)
- **screen_candidate** — Competency scoring, tier rating (A/B/C/D), hiring recommendation
- **draft_offer_letter** — Ready-to-send offer letter with equity, bonus, expiry, and tone options
- **create_onboarding_plan** — 30/60/90-day plan with Day 1 checklist and manager guide
- **build_interview_kit** — STAR questions, scorecard template, legal reminders
- **write_performance_review** — Full review with comp recommendation and manager meeting guide

### Founder-only (3 tools)
- **build_launch_playbook** — Complete go-to-market: ICP, channel plan, outbound sequence, week-by-week founder actions
- **weekly_founder_briefing** — Pipeline health, marketing pulse, team snapshot, prioritized action list
- **build_investor_narrative** — 10-slide pitch deck outline, elevator pitch, cold VC email, Q&A prep, red flag review

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "autostackup": {
      "command": "npx",
      "args": ["-y", "@autostackup/founder"]
    }
  }
}
```

With optional API keys for lead enrichment:

```json
{
  "mcpServers": {
    "autostackup": {
      "command": "npx",
      "args": ["-y", "@autostackup/founder"],
      "env": {
        "HUNTER_API_KEY": "your-hunter-key",
        "APOLLO_API_KEY": "your-apollo-key"
      }
    }
  }
}
```

### Individual packages

If you only need one domain, install separately:

```bash
npx @autostackup/sales
npx @autostackup/marketing
npx @autostackup/hr
```

## Example prompts

```
Qualify this lead: Acme Corp, 200 employees, VP of Sales is the buyer, budget $50k, need in 90 days

Build a launch playbook for my SaaS — $99/mo, targeting ops teams at 50-200 person startups, $20k budget, launching in 6 weeks

Give me a weekly briefing: 4 active deals worth $180k total, added 12 leads this week, 2 closed

Screen this candidate for a Senior Engineer role: 5 years backend, Python + AWS, no system design experience

Build me an investor narrative for a $2M seed round
```

## License

MIT — [Autostackup](https://github.com/Autostackup/autostackup)
