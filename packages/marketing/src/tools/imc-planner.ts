import { z } from "zod";
import { success, toMcpContent } from "@autostackup/core";

export const imcPlannerSchema = z.object({
  brand: z.string(),
  campaign: z.object({
    objective: z.enum([
      "awareness",
      "consideration",
      "conversion",
      "retention",
      "reactivation",
    ]),
    product: z.string(),
    targetAudience: z.string().describe("Describe your target audience in detail"),
    keyMessage: z.string().describe("The single most important message to convey"),
    budget: z.number().describe("Total campaign budget in USD"),
    durationWeeks: z.number().min(1).max(52).describe("Campaign duration in weeks"),
    geoTargets: z.array(z.string()).describe("Countries or cities to target"),
  }),
  channels: z.object({
    meta: z.boolean().default(true).describe("Include Meta (Facebook/Instagram) ads"),
    google: z.boolean().default(true).describe("Include Google Ads"),
    email: z.boolean().default(false).describe("Include email marketing"),
    content: z.boolean().default(false).describe("Include content / SEO"),
    influencer: z.boolean().default(false).describe("Include influencer marketing"),
  }),
  existingAssets: z.array(z.string()).optional().describe("Creative assets already available"),
});

type ImcPlannerInput = z.infer<typeof imcPlannerSchema>;

export function imcPlanner(input: ImcPlannerInput) {
  const { campaign, channels, brand } = input;
  const { budget, durationWeeks, objective } = campaign;

  const allocation = allocateBudget(budget, channels, objective);
  const metaPlan = channels.meta ? buildMetaPlan(input, allocation["meta"] ?? 0) : null;
  const googlePlan = channels.google ? buildGooglePlan(input, allocation["google"] ?? 0) : null;
  const emailPlan = channels.email ? buildEmailPlan(input) : null;
  const contentPlan = channels.content ? buildContentPlan(input) : null;

  const timeline = buildTimeline(durationWeeks, objective);
  const kpis = buildKpis(objective, budget);
  const creativeNeeds = buildCreativeNeeds(channels, objective);

  return toMcpContent(success({
    brand,
    campaign: {
      objective,
      duration: `${durationWeeks} weeks`,
      totalBudget: budget,
      budgetPerWeek: Math.round(budget / durationWeeks),
    },
    budgetAllocation: allocation,
    channels: {
      ...(metaPlan ? { meta: metaPlan } : {}),
      ...(googlePlan ? { google: googlePlan } : {}),
      ...(emailPlan ? { email: emailPlan } : {}),
      ...(contentPlan ? { content: contentPlan } : {}),
    },
    timeline,
    kpis,
    creativeNeeds,
    launchChecklist: buildLaunchChecklist(channels),
  }));
}

function allocateBudget(
  budget: number,
  channels: ImcPlannerInput["channels"],
  objective: string
): Record<string, number> {
  const activeChannels = Object.entries(channels)
    .filter(([, active]) => active)
    .map(([name]) => name);

  const weights: Record<string, Record<string, number>> = {
    awareness:    { meta: 45, google: 30, email: 5,  content: 10, influencer: 10 },
    consideration:{ meta: 35, google: 35, email: 10, content: 15, influencer: 5  },
    conversion:   { meta: 30, google: 45, email: 15, content: 5,  influencer: 5  },
    retention:    { meta: 20, google: 20, email: 45, content: 15, influencer: 0  },
    reactivation: { meta: 25, google: 25, email: 40, content: 5,  influencer: 5  },
  };

  const objWeights = weights[objective] ?? weights["awareness"]!;

  const relevantWeights = activeChannels.reduce((acc, ch) => {
    acc[ch] = objWeights[ch] ?? 10;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(relevantWeights).reduce((s, v) => s + v, 0);

  return Object.fromEntries(
    activeChannels.map((ch) => [
      ch,
      Math.round(budget * ((relevantWeights[ch] ?? 10) / total)),
    ])
  );
}

function buildMetaPlan(input: ImcPlannerInput, budget: number) {
  const { campaign } = input;
  const objective = campaign.objective;

  const campaignObjective =
    objective === "awareness" ? "BRAND_AWARENESS / REACH" :
    objective === "consideration" ? "TRAFFIC / VIDEO_VIEWS / ENGAGEMENT" :
    objective === "conversion" ? "CONVERSIONS / LEAD_GENERATION" :
    objective === "retention" ? "ENGAGEMENT / TRAFFIC" : "REACH";

  const funnelStructure =
    objective === "conversion"
      ? {
          tofu: { name: "Top of Funnel — Cold Audiences", budgetPct: 40, targeting: "Broad interest + Lookalike 5-10%" },
          mofu: { name: "Middle of Funnel — Warm Audiences", budgetPct: 35, targeting: "Video viewers 50%+, Page engagers, Website visitors 30d" },
          bofu: { name: "Bottom of Funnel — Retargeting", budgetPct: 25, targeting: "Website visitors 7d, ATC, Initiate checkout" },
        }
      : {
          cold: { name: "Cold Audiences", budgetPct: 70, targeting: "Broad + Interest stacks" },
          warm: { name: "Warm Retargeting", budgetPct: 30, targeting: "Engagers + Visitors 30d" },
        };

  return {
    campaignObjective,
    weeklyBudget: Math.round(budget / input.campaign.durationWeeks),
    totalBudget: budget,
    funnelStructure,
    adFormats: getMetaAdFormats(objective),
    audiences: buildMetaAudiences(input),
    copyAngles: buildCopyAngles(input),
    testingPlan: {
      week1_2: "Test 3 creatives x 2 audiences. Spend minimum $50/ad set/day.",
      week3_4: "Kill bottom 50% by CPM. Scale winners 20% every 3 days.",
      ongoing: "Refresh creative every 3-4 weeks to combat fatigue.",
    },
  };
}

function getMetaAdFormats(objective: string): string[] {
  if (objective === "awareness") return ["Reels (15s)", "Story ads", "Feed video (30s)"];
  if (objective === "consideration") return ["Carousel (product features)", "Video (60s explainer)", "Collection ad"];
  if (objective === "conversion") return ["Single image (offer-focused)", "Carousel (social proof)", "Lead form ad"];
  return ["Feed image", "Story", "Reels"];
}

function buildMetaAudiences(input: ImcPlannerInput): string[] {
  const audience = input.campaign.targetAudience.toLowerCase();
  const audiences: string[] = [
    `Lookalike 1% — based on existing customers`,
    `Lookalike 3-5% — broader reach`,
    `Interest stack: ${input.campaign.targetAudience.split(" ").slice(0, 3).join(", ")}`,
    `Retargeting: website visitors (30d) — all pages`,
    `Retargeting: video viewers 50%+ (${input.campaign.durationWeeks}w window)`,
  ];
  if (audience.includes("b2b") || audience.includes("business")) {
    audiences.push("Job title targeting: [relevant titles] in [industry]");
  }
  return audiences;
}

function buildCopyAngles(input: ImcPlannerInput): string[] {
  return [
    `Problem-agitate-solution: Lead with the pain point — "${input.campaign.keyMessage}"`,
    `Social proof: Lead with customer outcome or review`,
    `Curiosity: Ask a question your audience can't ignore`,
    `Direct offer: Discount, trial, or guarantee upfront`,
  ];
}

function buildGooglePlan(input: ImcPlannerInput, budget: number) {
  const { campaign } = input;
  const objective = campaign.objective;

  const campaignTypes: string[] = [];
  if (objective === "awareness") campaignTypes.push("Display", "YouTube TrueView");
  if (objective === "consideration") campaignTypes.push("Search — branded + category", "Display retargeting");
  if (objective === "conversion") campaignTypes.push("Search — high intent", "Performance Max", "Display retargeting");
  if (objective === "retention" || objective === "reactivation") campaignTypes.push("Search — branded", "Gmail ads", "Display");

  return {
    campaignTypes,
    weeklyBudget: Math.round(budget / input.campaign.durationWeeks),
    totalBudget: budget,
    searchStrategy: {
      keywordTypes: [
        "Exact match: [high-intent buying keywords]",
        "Phrase match: [category keywords]",
        "Broad match modified: [research keywords] — use sparingly",
      ],
      negativeKeywords: ["free", "DIY", "how to", "[competitor names]", "jobs", "salary"],
      bidStrategy: objective === "conversion" ? "Target CPA or Maximize Conversions" : "Target Impression Share (Awareness) or Maximize Clicks",
    },
    adCopyStructure: {
      headlines: [
        `${input.brand} — ${input.campaign.product}`,
        input.campaign.keyMessage.slice(0, 30),
        "Try Free / Get Started / Book a Demo",
      ],
      descriptions: [
        `${input.campaign.keyMessage}. Trusted by [X] companies.`,
        "No contracts. Cancel anytime. [USP here].",
      ],
    },
    extensions: ["Sitelinks (4+)", "Callouts", "Structured snippets", "Call extension", "Lead form (if conversion)"],
  };
}

function buildEmailPlan(input: ImcPlannerInput) {
  return {
    sequenceType: input.campaign.objective === "retention" ? "Lifecycle / winback" : "Nurture sequence",
    emailCount: Math.min(Math.floor(input.campaign.durationWeeks * 1.5), 12),
    cadence: "2x per week for first 2 weeks, then 1x weekly",
    sequence: [
      { email: 1, subject: "Welcome / Context setting", goal: "Set expectations, deliver value" },
      { email: 2, subject: "Educational content", goal: "Build authority, address top objection" },
      { email: 3, subject: "Social proof / case study", goal: "Reduce risk perception" },
      { email: 4, subject: "Direct offer or CTA", goal: "Drive conversion" },
      { email: 5, subject: "Follow-up / urgency", goal: "Re-engage non-openers" },
    ],
    kpis: { targetOpenRate: "25-35%", targetCTR: "3-5%", targetUnsubscribeRate: "<0.5%" },
  };
}

function buildContentPlan(input: ImcPlannerInput) {
  return {
    pillarTopics: [
      `${input.campaign.product} — how it works`,
      `${input.campaign.targetAudience} pain points and solutions`,
      `Industry trends and data reports`,
      `Comparison guides vs. alternatives`,
    ],
    contentTypes: ["Long-form blog (1500+ words, SEO-optimized)", "Short-form social clips", "Infographics", "Video explainers"],
    publishingCadence: "2 blog posts/week + daily social repurposing",
    seoFocus: "Target informational + commercial intent keywords in your niche",
  };
}

function buildTimeline(weeks: number, objective: string): Record<string, string> {
  const phases: Record<string, string> = {
    "Weeks 1-2": "Setup & Launch — pixel verification, creative production, audience building, UTM tagging",
  };

  if (weeks >= 4) phases["Weeks 3-4"] = "Learning Phase — A/B testing creatives and audiences, do NOT optimize budget yet";
  if (weeks >= 6) phases["Weeks 5-6"] = "Optimization — kill losers, scale winners, refresh creative";
  if (weeks >= 8) phases["Weeks 7-8"] = "Scale — increase budget on proven ad sets 20% every 3 days";
  if (weeks >= 10) phases[`Weeks 9-${weeks}`] = "Sustain & Iterate — maintain top performers, test new angles quarterly";

  return phases;
}

function buildKpis(objective: string, budget: number): Record<string, string> {
  const kpis: Record<string, Record<string, string>> = {
    awareness:    { primary: "Reach & CPM", secondary: "Brand recall lift", tertiary: "Share of Voice" },
    consideration:{ primary: "CTR & Landing page CR", secondary: "Time on site", tertiary: "Video view rate" },
    conversion:   { primary: "CPA (Cost per acquisition)", secondary: "ROAS", tertiary: "MQL volume" },
    retention:    { primary: "Reactivation rate", secondary: "Email open rate", tertiary: "LTV change" },
    reactivation: { primary: "Win-back rate", secondary: "Reactivated revenue", tertiary: "Email CTR" },
  };

  const targets = kpis[objective] ?? kpis["awareness"]!;
  return {
    ...targets,
    weeklyBudgetPacing: `$${Math.round(budget / 4)}/week check-in — reallocate if channel is under-delivering`,
    reportingCadence: "Weekly performance review. Monthly strategic review.",
  };
}

function buildCreativeNeeds(channels: ImcPlannerInput["channels"], objective: string): string[] {
  const needs: string[] = [];
  if (channels.meta) {
    needs.push("Meta: 1080x1080 static (x3 variants)", "Meta: 9:16 Reels/Story video 15-30s (x2)", "Meta: 1200x628 feed image (x2)");
  }
  if (channels.google) {
    needs.push("Google: Responsive Search Ad copy (15 headlines, 4 descriptions)", "Google Display: 300x250, 728x90, 160x600, 320x50");
  }
  if (channels.email) needs.push("Email: Header banner 600px wide, Copy per email sequence");
  if (channels.content) needs.push("Content: Blog featured images, Social cut-downs from long-form");
  return needs;
}

function buildLaunchChecklist(channels: ImcPlannerInput["channels"]): string[] {
  const checklist = [
    "UTM parameters set up for all channels",
    "Conversion tracking verified (pixel fires on thank-you page)",
    "Landing page mobile-optimized and loads <3s",
    "Brand safety keywords/exclusions configured",
  ];
  if (channels.meta) checklist.push("Meta Pixel firing correctly", "Meta CAPI (server-side events) configured", "Business Manager ad account approved");
  if (channels.google) checklist.push("Google Ads conversion tracking imported", "Google Tag Manager container published", "Search campaign negative keywords added");
  if (channels.email) checklist.push("SPF/DKIM/DMARC DNS records verified", "Unsubscribe footer compliant", "List segmented and suppression list loaded");
  return checklist;
}

export const imcPlannerTool = {
  name: "plan_imc_campaign",
  description:
    "Build a full Integrated Marketing Communications (IMC) campaign plan across Meta, Google Ads, email, and content. " +
    "Returns budget allocation, channel-specific strategy, timeline, KPIs, and creative brief.",
  schema: imcPlannerSchema,
  handler: imcPlanner,
};
