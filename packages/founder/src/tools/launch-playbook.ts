import { z } from "zod";
import { success, failure, toMcpContent } from "@autostackup/core";

export const launchPlaybookSchema = z.object({
  companyName: z.string().describe("Company or product name"),
  productDescription: z.string().describe("What the product does and the core problem it solves"),
  targetMarket: z.string().describe("Who you are selling to (industry, company size, persona)"),
  pricePoint: z.string().describe("Pricing model and price range (e.g. $500/mo SaaS, $50k enterprise contract)"),
  launchTimeline: z.string().describe("When you plan to launch or already launched (e.g. '6 weeks', 'live today')"),
  budget: z.string().describe("Total go-to-market budget available (e.g. '$20k', 'bootstrapped')"),
  currentTraction: z.string().optional().describe("Any existing customers, revenue, waitlist, or social proof"),
  competitors: z.array(z.string()).optional().describe("Top 3 competitors to differentiate from"),
  channels: z.array(z.string()).optional().describe("Channels to prioritize (e.g. LinkedIn outbound, content, paid, partnerships)"),
});

type LaunchPlaybookInput = z.infer<typeof launchPlaybookSchema>;

interface LaunchPlaybook {
  executiveSummary: string;
  icpProfile: {
    firmographics: string;
    painPoints: string[];
    buyerPersona: string;
    messagingAngle: string;
  };
  marketingPlan: {
    positioningStatement: string;
    channels: ChannelPlan[];
    contentThemes: string[];
    week1Priorities: string[];
  };
  salesPlan: {
    idealDealSize: string;
    qualificationCriteria: string[];
    outreachSequence: OutreachStep[];
    pipelineTargets: PipelineTarget[];
  };
  founderActions: WeeklyAction[];
  successMetrics: Metric[];
}

interface ChannelPlan {
  channel: string;
  rationale: string;
  budgetAllocation: string;
  kpi: string;
}

interface OutreachStep {
  day: string;
  medium: string;
  objective: string;
  message: string;
}

interface PipelineTarget {
  stage: string;
  targetCount: number;
  conversionRate: string;
}

interface WeeklyAction {
  week: string;
  actions: string[];
  milestone: string;
}

interface Metric {
  metric: string;
  target: string;
  frequency: string;
}

export function buildLaunchPlaybook(input: LaunchPlaybookInput): ReturnType<typeof toMcpContent> {
  try {
    const channels = input.channels ?? ["LinkedIn outbound", "Content / SEO", "Paid social"];
    const competitors = input.competitors ?? [];
    const isBoostrapped = input.budget.toLowerCase().includes("bootstrap") ||
      input.budget.toLowerCase().includes("0") ||
      input.budget.includes("$0");

    const playbook: LaunchPlaybook = {
      executiveSummary: buildExecutiveSummary(input),
      icpProfile: buildIcpProfile(input),
      marketingPlan: buildMarketingPlan(input, channels, competitors),
      salesPlan: buildSalesPlan(input),
      founderActions: buildFounderActions(input, isBoostrapped),
      successMetrics: buildSuccessMetrics(input),
    };

    return toMcpContent(success(playbook));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return toMcpContent(failure(`Launch playbook failed: ${msg}`, "UNKNOWN"));
  }
}

function buildExecutiveSummary(input: LaunchPlaybookInput): string {
  return (
    `${input.companyName} Go-To-Market Playbook\n\n` +
    `Product: ${input.productDescription}\n` +
    `Market: ${input.targetMarket}\n` +
    `Price: ${input.pricePoint}\n` +
    `Timeline: ${input.launchTimeline}\n` +
    `Budget: ${input.budget}\n` +
    (input.currentTraction ? `Traction: ${input.currentTraction}\n` : "") +
    `\nThis playbook gives you a week-by-week execution plan across marketing, sales, and hiring to drive your first $1M ARR.`
  );
}

function buildIcpProfile(input: LaunchPlaybookInput): LaunchPlaybook["icpProfile"] {
  return {
    firmographics: input.targetMarket,
    painPoints: [
      `Core problem: ${input.productDescription.split(".")[0]}`,
      "Status quo is costly, slow, or error-prone without a modern solution",
      "Decision maker feels pressure to show ROI within the quarter",
      "Existing tools require manual workarounds or expensive consultants",
    ],
    buyerPersona: deriveBuyerPersona(input.targetMarket),
    messagingAngle: deriveMessagingAngle(input),
  };
}

function deriveBuyerPersona(targetMarket: string): string {
  const m = targetMarket.toLowerCase();
  if (m.includes("startup") || m.includes("founder")) {
    return "Founder / CEO — moves fast, hates bureaucracy, needs ROI proof in 30 days";
  }
  if (m.includes("enterprise") || m.includes("fortune")) {
    return "VP or Director — owns budget, needs executive-ready reporting, risk-averse";
  }
  if (m.includes("smb") || m.includes("small") || m.includes("mid")) {
    return "Owner or Ops Lead — generalist wearing many hats, price-sensitive, wants quick wins";
  }
  return "Economic Buyer (VP/Director level) — owns the problem, controls the budget";
}

function deriveMessagingAngle(input: LaunchPlaybookInput): string {
  if (input.currentTraction) {
    return `Proof-led: Lead with social proof — '${input.currentTraction.split(",")[0]}' — then connect to the buyer's pain.`;
  }
  return `Problem-led: Open with the cost of the status quo, then show ${input.companyName} as the fastest path to the outcome they want.`;
}

function buildMarketingPlan(
  input: LaunchPlaybookInput,
  channels: string[],
  competitors: string[]
): LaunchPlaybook["marketingPlan"] {
  const positioningStatement =
    `For ${input.targetMarket} who struggle with ${extractCoreProblem(input.productDescription)}, ` +
    `${input.companyName} is the ${extractCategory(input.productDescription)} that ${extractKeyBenefit(input.productDescription)}` +
    (competitors.length > 0 ? `, unlike ${competitors[0]} which requires more time and money to implement.` : ".");

  const channelPlans: ChannelPlan[] = channels.map((ch) => buildChannelPlan(ch, input.budget));

  return {
    positioningStatement,
    channels: channelPlans,
    contentThemes: [
      `"How ${input.targetMarket} solve [problem] without [status quo pain]"`,
      `ROI benchmarks: What does ignoring this cost you per quarter?`,
      `${input.companyName} vs. doing it manually — time and cost comparison`,
      `Customer story: Before and after using ${input.companyName}`,
      `The ${extractCategory(input.productDescription)} checklist every ${deriveBuyerTitle(input.targetMarket)} needs`,
    ],
    week1Priorities: [
      "Publish your positioning statement on LinkedIn — personal account, not company page",
      "Write one long-form 'founder perspective' post on the core problem",
      "Set up Google Search Console and basic analytics",
      "Create a 5-step email nurture sequence for new leads",
      "Record a 3-minute product walkthrough video",
    ],
  };
}

function extractCoreProblem(description: string): string {
  return description.split(".")[0]?.replace(/^.+solve[sd]?\s+/i, "").trim() ?? description.slice(0, 60);
}

function extractCategory(description: string): string {
  if (description.toLowerCase().includes("platform")) return "platform";
  if (description.toLowerCase().includes("tool")) return "tool";
  if (description.toLowerCase().includes("service")) return "service";
  if (description.toLowerCase().includes("software")) return "software";
  return "solution";
}

function extractKeyBenefit(description: string): string {
  return description.split(".").slice(-1)[0]?.trim() ?? "delivers measurable results faster";
}

function deriveBuyerTitle(targetMarket: string): string {
  const m = targetMarket.toLowerCase();
  if (m.includes("cto") || m.includes("engineer")) return "CTO";
  if (m.includes("cmo") || m.includes("market")) return "CMO";
  if (m.includes("cfo") || m.includes("financ")) return "CFO";
  if (m.includes("founder")) return "founder";
  return "operator";
}

function buildChannelPlan(channel: string, budget: string): ChannelPlan {
  const isBootstrapped = budget.toLowerCase().includes("bootstrap") || budget.toLowerCase().includes("$0");
  const ch = channel.toLowerCase();

  if (ch.includes("linkedin") || ch.includes("outbound")) {
    return {
      channel: "LinkedIn Outbound",
      rationale: "Highest ROI cold channel for B2B; personal DMs from founder convert 3–8× better than company ads",
      budgetAllocation: isBootstrapped ? "$0 — founder time only (20 DMs/day)" : "15% — Sales Navigator + automation",
      kpi: "50 conversations/week → 10 demos → 2 closes",
    };
  }
  if (ch.includes("content") || ch.includes("seo")) {
    return {
      channel: "Content / SEO",
      rationale: "Compounds over time; bottom-of-funnel keywords convert leads already in buying mode",
      budgetAllocation: isBootstrapped ? "$0 — founder writes weekly" : "20% — writer + distribution",
      kpi: "2 posts/week; 1,000 organic sessions by month 3",
    };
  }
  if (ch.includes("paid") || ch.includes("ads")) {
    return {
      channel: "Paid Acquisition",
      rationale: "Fastest feedback loop on messaging; test ICP assumptions before scaling spend",
      budgetAllocation: isBootstrapped ? "Defer until $10k MRR" : "40% — Meta + Google retargeting",
      kpi: "CAC < 3× ACV; ROAS > 3×",
    };
  }
  if (ch.includes("partner") || ch.includes("referral")) {
    return {
      channel: "Partnerships / Referrals",
      rationale: "Zero marginal cost; trust transfer from partner network dramatically shortens sales cycles",
      budgetAllocation: isBootstrapped ? "$0 — rev share agreements" : "10% — partner portal + SPIFFs",
      kpi: "3 active partners; 20% of new pipeline from referrals by month 6",
    };
  }
  return {
    channel,
    rationale: "Prioritize based on where your ICP already spends time",
    budgetAllocation: "Allocate based on measured CAC after first 30 days",
    kpi: "Define primary conversion metric before spending",
  };
}

function buildSalesPlan(input: LaunchPlaybookInput): LaunchPlaybook["salesPlan"] {
  const avgDealSize = estimateACV(input.pricePoint);

  return {
    idealDealSize: avgDealSize,
    qualificationCriteria: [
      `Budget: Can allocate ${input.pricePoint} without 3-month approval cycles`,
      `Authority: Decision maker or strong internal champion engaged`,
      `Need: Active pain point with measurable cost — not exploring`,
      `Timeline: Needs a solution within 90 days or has a forcing function`,
      `ICP fit: Matches target market: ${input.targetMarket}`,
    ],
    outreachSequence: [
      {
        day: "Day 1",
        medium: "LinkedIn connection + note",
        objective: "Earn the open",
        message: `Hey [Name] — noticed you're at [Company]. We work with ${input.targetMarket} to ${extractKeyBenefit(input.productDescription)}. Worth a 15-min call?`,
      },
      {
        day: "Day 3",
        medium: "Email",
        objective: "Lead with insight, not pitch",
        message: `Subject: [Company] + [pain point]\n\n[Name], saw you're scaling [relevant signal]. Most ${input.targetMarket} I talk to are losing [cost of problem]. ${input.companyName} solves that in [timeframe]. Happy to share how — 15 mins this week?`,
      },
      {
        day: "Day 7",
        medium: "LinkedIn DM",
        objective: "Soft social proof close",
        message: `[Name] — following up on my note. [Similar company] just [result] using ${input.companyName}. Would it be useful to see how?`,
      },
      {
        day: "Day 14",
        medium: "Email — breakup",
        objective: "Re-engage with permission",
        message: `Closing the loop — if the timing isn't right, no worries. I'll check back in Q[X+1]. Either way, happy to send over our [guide/benchmark] — useful regardless of whether we work together.`,
      },
    ],
    pipelineTargets: [
      { stage: "Outreach sent", targetCount: 200, conversionRate: "25% reply" },
      { stage: "Conversations", targetCount: 50, conversionRate: "40% to demo" },
      { stage: "Demos", targetCount: 20, conversionRate: "25% to proposal" },
      { stage: "Proposals out", targetCount: 5, conversionRate: "40% close" },
      { stage: "Closed / Won", targetCount: 2, conversionRate: "First 60 days" },
    ],
  };
}

function estimateACV(pricePoint: string): string {
  const nums = pricePoint.match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return "Verify pricing before forecasting pipeline";
  const n = parseInt(nums[0].replace(/,/g, ""), 10);
  if (pricePoint.toLowerCase().includes("mo") || pricePoint.toLowerCase().includes("month")) {
    return `$${(n * 12).toLocaleString()} ACV ($${n.toLocaleString()}/mo × 12)`;
  }
  if (pricePoint.toLowerCase().includes("year") || pricePoint.toLowerCase().includes("annual")) {
    return `$${n.toLocaleString()} ACV`;
  }
  return `~$${n.toLocaleString()} per deal`;
}

function buildFounderActions(input: LaunchPlaybookInput, isBootstrapped: boolean): WeeklyAction[] {
  return [
    {
      week: "Week 1",
      actions: [
        "Lock ICP definition — document in one page, share with any advisors",
        "Publish positioning statement on LinkedIn (personal account)",
        "Send first 50 outbound LinkedIn connection requests to ICP",
        "Set up HubSpot Free or Notion CRM to track every conversation",
        isBootstrapped ? "Offer 3 design-partner spots at 50% discount for testimonials" : "Allocate $2k for initial paid test on Meta or Google",
      ],
      milestone: "50 outreach contacts in CRM; positioning live on LinkedIn",
    },
    {
      week: "Week 2",
      actions: [
        "Book 5 discovery calls with ICP prospects",
        "Record and post a 3-minute product demo video",
        "Write and publish first long-form content piece",
        "Follow up on all week-1 outreach with Day 7 message",
        "Set up Google Analytics + Search Console",
      ],
      milestone: "5 discovery calls completed; demo video live",
    },
    {
      week: "Week 3–4",
      actions: [
        "Convert at least 2 discoveries to demos",
        "Send first proposals — aim for 2 closed deals",
        "Collect first testimonials from any paying customers",
        "Analyze outreach reply rate — iterate subject lines and opening hook",
        "Identify 2 potential referral partners and reach out",
      ],
      milestone: "First paying customers; testimonials collected",
    },
    {
      week: "Month 2",
      actions: [
        "Hire first sales or marketing resource (contract first)",
        "Document repeatable sales process based on what's working",
        "Launch referral or partner program",
        "Begin investor pipeline if raising (warm intros only)",
        "Run first customer success check-in — NPS and expansion opportunity",
      ],
      milestone: `$${input.pricePoint.includes("k") ? "50k" : "10k"} pipeline created; first hire onboarded`,
    },
  ];
}

function buildSuccessMetrics(input: LaunchPlaybookInput): Metric[] {
  return [
    { metric: "Outreach sent / week", target: "100+", frequency: "Weekly" },
    { metric: "Discovery calls booked / week", target: "5+", frequency: "Weekly" },
    { metric: "Demo to proposal rate", target: ">25%", frequency: "Monthly" },
    { metric: "Proposal to close rate", target: ">30%", frequency: "Monthly" },
    { metric: "CAC (cost to acquire customer)", target: `<3× monthly price`, frequency: "Monthly" },
    { metric: "Pipeline coverage", target: "3× monthly revenue target", frequency: "Monthly" },
    { metric: "NPS from first 10 customers", target: ">50", frequency: "After onboarding" },
    { metric: "Monthly recurring revenue (MRR) growth", target: ">20% MoM for first 6 months", frequency: "Monthly" },
  ];
}

export const launchPlaybookTool = {
  name: "build_launch_playbook",
  description:
    "Generate a complete go-to-market playbook for a new product or business — ICP profile, marketing plan with channel-by-channel budget allocation, outbound sales sequence, week-by-week founder action plan, and success metrics dashboard. Covers everything a strategy consultant would charge $20k to produce.",
} as const;
