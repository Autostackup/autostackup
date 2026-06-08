# @autostackup/hr

**The only HR MCP you'll ever need.**

Professionally built candidate screening, 30/60/90-day onboarding plans, offer letter generation, interview kits, and performance reviews — frameworks used by top People teams, all inside Claude. What HR consultants charge thousands for, you get in one prompt.

## Tools

### `screen_candidate`
Score a candidate against your role's required skills, experience level, and must-haves. Uses structured competency scoring across four dimensions: Skills Match (35%), Experience Level (30%), Background Quality (25%), Red Flag Risk (10%). Hard-disqualifies on any must-have miss.

**Returns:** Tier (A/B/C/D), overall score, dimension scores, skill gaps, salary fit assessment, recommended next step.

**Try it:** *"Screen this candidate for a Senior Engineer role: 5 years backend Python, AWS experience, no system design background, asking $180k"*

---

### `draft_offer_letter`
Generate a complete, ready-to-send offer letter with full compensation summary, equity and bonus clauses, offer expiry date, negotiation talking points, and a follow-up call script. Supports formal, warm, and startup tones.

**Returns:** Full offer letter text, compensation summary table, negotiation notes, follow-up script.

**Try it:** *"Draft an offer letter for a Senior Engineer, $160k base, 0.5% equity, $10k signing, warm tone, expires in 5 days"*

---

### `create_onboarding_plan`
Build a complete 30/60/90-day onboarding plan for any new hire. Includes Day 1 checklist, weekly themes and goals, milestone definitions, manager action checklist, red flag warnings, and a success definition. Adapts for individual contributor, manager, and executive roles.

**Returns:** Day 1 checklist, 30/60/90-day plans with weekly breakdown, manager guide, success metrics.

**Try it:** *"Create a 30/60/90 onboarding plan for a new Head of Marketing joining a 30-person SaaS startup"*

---

### `build_interview_kit`
Generate a complete interview kit for any role and interview type. Structured STAR questions by competency, follow-up probes, "what good looks like" benchmarks, red flag questions, a scorecard template, legal reminders, and a debrief facilitation guide.

**Supports:** Screening, technical, behavioural, case, panel, and final interviews.

**Returns:** Question bank by competency, follow-up probes, scorecard, legal reminders, debrief guide.

**Try it:** *"Build a behavioural interview kit for a VP of Sales role, 5 competencies, 60-minute format"*

---

### `write_performance_review`
Write a structured performance review with achievements narrative, areas for development, next-period goals, compensation recommendation, and a manager meeting prep guide. Adapts to all rating levels and supports coaching, direct, and formal tones.

**Ratings supported:** Exceeds expectations / Meets expectations / Partially meets / Does not meet

**Returns:** Full review narrative, development plan, goals section, comp recommendation, manager meeting script.

**Try it:** *"Write a performance review for a Product Manager, meets expectations, strong on delivery but needs to improve stakeholder communication, eligible for 5% merit increase"*

---

## Setup

```json
{
  "mcpServers": {
    "autostackup-hr": {
      "command": "npx",
      "args": ["-y", "@autostackup/hr"]
    }
  }
}
```

No API keys required. All tools run entirely on Claude.

---

## Part of the Autostackup Suite

| Package | Description |
|---------|-------------|
| [@autostackup/founder](https://www.npmjs.com/package/@autostackup/founder) | All tools in one server + founder orchestration |
| [@autostackup/sales](https://www.npmjs.com/package/@autostackup/sales) | BANT/MEDDIC qualification, ICP scoring, outreach |
| [@autostackup/marketing](https://www.npmjs.com/package/@autostackup/marketing) | Kotler audit, IMC planning, audience segmentation |
| **@autostackup/hr** | ← You are here |

## License

MIT — [Autostackup](https://github.com/Autostackup/autostackup)
