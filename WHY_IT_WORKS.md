# Why Autostackup Works — The Framework Argument

---

## The Problem With Every Other AI Business Tool

Every AI tool promises to make you more productive. Most of them deliver faster *execution* of the same mediocre thinking.

They'll write your email faster. Summarize your meeting faster. Draft your proposal faster.

What they won't do is *think better than you* about your sales pipeline, your go-to-market strategy, or your marketing mix — because they have no framework to think with.

Autostackup is different. It doesn't just run Claude on your inputs. It runs Claude through the same structured frameworks that McKinsey consultants, Fortune 500 CMOs, and elite sales organizations have used for decades.

This is the difference between asking someone "is this a good deal?" and walking them through a 47-question due diligence checklist.

---

## @autostackup/sales — Why BANT + MEDDIC Together Is the Gold Standard

### The Problem With Gut Feel in Sales

Most salespeople qualify leads the same way: vibes, experience, and hope. They spend hours on deals that were never going to close and ignore signals that a deal is slipping. The result is a pipeline that *looks* healthy and a forecast that's consistently wrong.

The solution isn't to work harder. It's to apply the same frameworks that the world's best sales organizations have used for 60 years.

### What Is BANT? (And Why It's Still Used by IBM, Salesforce, and Oracle)

BANT was developed by IBM in the 1950s and is still the most widely taught sales qualification framework in the world. Every major sales certification — from Sandler to Miller Heiman — teaches some version of it.

**Budget** — Does the prospect have money allocated for this?
**Authority** — Are you talking to the person who can sign?
**Need** — Is there a genuine business problem your product solves?
**Timeline** — Is there urgency, or is this exploratory?

BANT is fast. It filters out 60–70% of unqualified leads in the first conversation. That's why it's still used by companies with thousands of salespeople who need consistent qualification across the entire team.

**The limitation:** BANT tells you *if* a deal is possible. It doesn't tell you *how* to win it.

### What Is MEDDIC? (And Why Enterprise Sales Teams Won't Use Anything Else)

MEDDIC was developed at PTC in the 1990s and became the qualification framework of choice for complex enterprise sales. Companies like Salesforce, HubSpot, and Gong are built on teams that live and die by MEDDIC.

**Metrics** — What measurable outcomes matter to the buyer?
**Economic Buyer** — Who controls the budget? (Not just who you're talking to)
**Decision Criteria** — What are they using to evaluate vendors?
**Decision Process** — How does their organization actually make this decision?
**Identified Pain** — What specific pain is urgent enough to create action?
**Champion** — Who inside the organization is selling this for you?

MEDDIC is deeper. It tells you *how* a deal will close, who's involved, and whether you have the internal advocacy to win. Teams that switch to MEDDIC typically see 20–30% improvement in win rates within the first year.

**The limitation:** MEDDIC requires more data collection. You can't complete it in the first call.

### Why `qualify_lead` Runs Both — And Why That Matters

Using BANT alone means you'll pursue deals you can't win.
Using MEDDIC alone means you'll miss deals that move fast.
Using both means you get the early filter *and* the depth.

`qualify_lead` scores your lead on both frameworks simultaneously, weights them (40% BANT, 60% MEDDIC — reflecting the depth advantage of MEDDIC for complex deals), and produces:

- A **combined score** that reflects both quick viability and deal complexity
- A **tier** (A/B/C/D) that maps to a concrete action (close now / develop / nurture / deprioritize)
- A **gap analysis** that tells you exactly what you're missing and why it matters
- A **recommended next step** that's specific to this deal, not generic

This is what a $500/hr sales consultant would give you after an hour of questioning. Autostackup gives it to Claude in under 10 seconds.

---

### `score_icp` — Why Ideal Customer Profile Is the Most Underused Tool in Sales

Most companies have an ICP document buried in a Notion page that no one reads. The problem isn't that they don't have an ICP — it's that they never apply it consistently.

A properly applied ICP eliminates 40–60% of prospects before your team invests any time. The best sales teams in the world (Stripe, Figma, Notion's early GTM) are obsessive about ICP adherence because they understand the compounding math: if you only pursue deals you have an 80% chance of winning, your output per rep doubles without hiring.

`score_icp` operationalizes your ICP. Define it once — industries, company sizes, titles, geographies, must-haves. Every prospect gets scored against it. Deals that fail a must-have are disqualified instantly. Deals that fit get a score and priority tier.

This is how you scale ICP discipline from one experienced rep to a team of twenty.

---

### `track_pipeline` — Why Weighted Forecasting Is the Only Honest Way to Look at Revenue

A pipeline report that shows "deals in each stage" tells you almost nothing. It's counting, not forecasting.

Weighted forecasting — multiplying deal value by close probability — is the standard method used by every serious revenue operations team. Salesforce, HubSpot, and every enterprise CRM calculates it this way because it's the only method that produces accurate revenue predictions.

`track_pipeline` goes further by adding two signals that most CRMs don't surface clearly:

**Stale deals** — Research shows deals with no activity for 14+ days are 40% less likely to close. Flagging them creates urgency before they die quietly.

**At-risk deals** — A deal closing in 7 days with 35% probability isn't just risky — it's a lie in your forecast. Surfacing these forces honest pipeline reviews.

The output is a prioritized action list. Not a report to file. Decisions to make today.

---

### `generate_outreach` — Why Personalization at Scale Is the Only Outreach Strategy That Works Anymore

Cold email open rates have fallen from 24% in 2015 to under 15% today. The reason isn't email fatigue — it's template fatigue. Buyers can identify a mass sequence in two sentences and delete it.

The research is clear: personalized outreach outperforms generic templates by 6x in reply rate (Salesloft, 2023). But personalization at scale has always required either a huge team or hours of research per prospect.

`generate_outreach` builds personalized copy from your inputs — their pain point, your value prop, their industry context, and any social proof you have. It gives you four subject lines because A/B testing subject lines is the single highest-leverage email optimization available (a 10% improvement in open rate compounds across every send). It includes a follow-up because 80% of sales happen after the fifth contact, and most reps stop after two.

---

## @autostackup/marketing — Why Kotler Is the Framework That Trained Every CMO You've Ever Met

### The Problem With Most AI Marketing Tools

Most AI marketing tools generate content. They'll write your ad copy, draft your social posts, and summarize your analytics. They are, essentially, faster interns.

What they don't do is diagnose *why* your marketing isn't working, or tell you *where* to invest next to get the biggest return.

That requires a framework. And the framework that has trained more CMOs than any other — taught in business schools from Harvard to INSEAD to NUS — is Philip Kotler's marketing mix.

### Who Is Philip Kotler and Why Should You Trust His Framework?

Philip Kotler is a Distinguished Professor of Marketing at Northwestern University's Kellogg School of Management. He's been called the "father of modern marketing" by *The Financial Times*. His textbook, *Marketing Management*, has been in continuous publication since 1967 and is the best-selling marketing textbook in the world. It has been used to train marketing professionals in over 58 countries.

When a Fortune 500 CMO says they "audited the marketing mix," they mean they applied some version of Kotler's framework. When a McKinsey team advises a consumer brand on go-to-market strategy, the underlying structure is Kotler's framework.

This is not a startup founder's opinion about marketing. This is 60 years of academic research, validated across thousands of companies, in every industry, on every continent.

### The 9 Elements — Why Each One Matters

The original 4Ps (Product, Price, Place, Promotion) were Kotler's 1960s formulation. The extended 9-element model adds People, Process, Physical Evidence, Positioning, and Performance — reflecting the reality of service businesses, digital products, and modern brand-building.

**Product** — Most founders think they have a product problem when they actually have a positioning problem, and vice versa. Scoring product separately forces the right diagnosis.

**Price** — Value-based pricing consistently delivers 10–20% higher margins than cost-plus pricing (McKinsey pricing research, 2022). Most companies leave this money on the table because they've never formally evaluated their pricing strategy.

**Place** — The average B2B SaaS company that adds a direct digital channel sees 25–40% more revenue within 18 months. Channel analysis isn't optional — it's where growth lives.

**Promotion** — Companies that run 4+ promotion channels simultaneously see 300% higher customer lifetime value than single-channel companies (Omnisend, 2023). The question isn't whether to diversify — it's which channels to add first.

**People** — In service businesses, people *are* the product. Gaps in sales or customer success show up directly in revenue retention. Diagnosing people separately makes the invisible visible.

**Process** — Every hour of friction in your delivery process is an hour your competitor can use against you. Process analysis surfaces the optimization opportunities that feel like operational details but compound into competitive advantages.

**Physical Evidence** — 93% of consumers read online reviews before making a purchase (BrightLocal, 2023). Physical evidence — reviews, testimonials, website quality — is the trust infrastructure that makes everything else work. It's almost always underinvested.

**Positioning** — Ries and Trout's *Positioning*, one of the most-cited marketing books ever written, argues that positioning is the single most important strategic decision a company makes. Kotler's framework forces you to evaluate it explicitly rather than leaving it implicit.

**Performance** — What gets measured gets managed. Companies that track CAC, LTV, and payback period alongside vanity metrics make fundamentally better resource allocation decisions.

### What `kotler_analysis` Does That a Consultant Can't

A Kotler audit from a mid-tier consulting firm costs $15,000–$40,000 and takes 6–8 weeks. The output is a 40-page PowerPoint with the same structure every time.

`kotler_analysis` takes your inputs, scores each element, identifies the gaps, ranks the priorities, and produces a structured output — in under 60 seconds.

It doesn't replace deep market research. But it does something a consultant rarely does: it tells you exactly which element to fix first, why, and what good looks like.

---

### `plan_imc_campaign` — Why Integrated Marketing Communications Is the Only Way to Run a Campaign

### What Is IMC and Why Does It Matter?

Integrated Marketing Communications (IMC) is the discipline of coordinating all marketing channels around a single strategy, message, and objective. It was formalized as a field in the 1990s when Kotler, Don Schultz, and others recognized that fragmented marketing — different agencies running disconnected campaigns on different channels — was producing dramatically worse results than coordinated, message-aligned campaigns.

The research on IMC is unambiguous:
- Companies with consistent brand presentation across all channels see 3.5x more brand visibility (Lucidpress, 2021)
- Integrated campaigns drive 23% more revenue than non-integrated campaigns (Aberdeen Group)
- Cross-channel campaigns have a 494% higher purchase rate than single-channel campaigns (Omnisend, 2022)

IMC is not a buzzword. It's the reason major brands hire Chief Marketing Officers instead of separate advertising, digital, and PR managers — because integration is where the performance premium lives.

### What `plan_imc_campaign` Gives You

Most tools will plan a Meta campaign. Some will plan a Google campaign. None of them will:

- Allocate your budget intelligently across channels based on your objective
- Coordinate the messaging so your Meta TOFU audience and your Google Search campaign are telling the same story
- Give you a week-by-week timeline that accounts for the platform learning phases
- Produce a creative brief that ensures your designer builds assets for every placement
- Deliver a launch checklist that catches the technical setup errors that silently kill campaign performance

This is what an integrated agency charges $8,000–$15,000/month to do. `plan_imc_campaign` does it from a single prompt.

---

### `segment_audience` — Why Segmentation Is the Multiplier on Everything Else

The marketing principle underlying segmentation is one of the oldest and most validated in the field: different customers have different needs, different buying triggers, and different communication preferences. One message to all of them performs worse than tailored messages to each segment.

This isn't theory. It's the reason every major consumer brand — Apple, Nike, LVMH — runs different creative for different audience segments even when selling the same product. It's the reason B2B companies like Salesforce have separate enterprise and SMB go-to-market motions.

`segment_audience` doesn't just describe your segments. It builds a **messaging matrix** — the specific headline, subheadline, CTA, and proof format for each segment. This is the output that makes all downstream work (ads, emails, landing pages, sales scripts) faster and better, because everyone is working from the same strategic map.

---

## The Real Reason Autostackup Works

Most AI tools improve the speed of execution. Autostackup improves the quality of thinking.

Speed of execution is a commodity. OpenAI, Anthropic, Google, and a thousand startups are all racing to make execution faster.

Quality of thinking is rare. It requires frameworks — structures for organizing information that have been validated over decades, refined by practitioners, and taught in the world's best business schools.

BANT. MEDDIC. Kotler's 9 elements. IMC. ICP scoring. These frameworks exist because they work. They've been battle-tested across thousands of companies, in every market cycle, at every scale.

We didn't invent these frameworks. We encoded them into tools that Claude can apply to your specific situation, with your specific data, and return structured, actionable output.

That's why Autostackup isn't just another AI tool. It's the business brain your AI was missing.

---

*Built on the frameworks that trained the world's best sales leaders and CMOs.
Available to anyone with Claude Desktop.*

**npm install @autostackup/sales @autostackup/marketing**
