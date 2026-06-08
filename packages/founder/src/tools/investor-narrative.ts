import { z } from "zod";
import { success, failure, toMcpContent } from "@autostackup/core";

export const investorNarrativeSchema = z.object({
  companyName: z.string().describe("Company name"),
  oneLiner: z.string().describe("One sentence that explains what the company does and who it's for"),
  problem: z.string().describe("The problem you solve — the pain, its frequency, and who suffers it most"),
  solution: z.string().describe("How your product solves it — the core mechanism, not a feature list"),
  marketSize: z.object({
    tam: z.string().describe("Total Addressable Market — the entire market if you captured 100% (e.g. '$40B global HR software market')"),
    sam: z.string().describe("Serviceable Addressable Market — the portion you can realistically reach (e.g. '$3B US mid-market HR')"),
    som: z.string().describe("Serviceable Obtainable Market — what you can capture in 3 years (e.g. '$30M if we take 1% of SAM')"),
  }).describe("Market size breakdown (TAM / SAM / SOM)"),
  traction: z.object({
    revenue: z.string().optional().describe("Current MRR or ARR (e.g. '$25k MRR')"),
    customers: z.string().optional().describe("Number and type of customers (e.g. '18 paying SMBs')"),
    growth: z.string().optional().describe("Month-over-month or YoY growth rate (e.g. '22% MoM for last 3 months')"),
    keyMilestones: z.array(z.string()).optional().describe("Top 3–5 milestones achieved (e.g. 'Signed Fortune 500 pilot')"),
  }).describe("Traction evidence"),
  businessModel: z.string().describe("How you make money — pricing, contract structure, expansion revenue"),
  competition: z.array(z.object({
    name: z.string().describe("Competitor name"),
    weakness: z.string().describe("Their key weakness or gap your product fills"),
  })).describe("Top 2–4 competitors and why you win"),
  team: z.array(z.object({
    name: z.string().describe("Team member name"),
    role: z.string().describe("Role (e.g. CEO, CTO)"),
    credentialHighlight: z.string().describe("One standout credential or achievement"),
  })).describe("Core founding team"),
  fundingAsk: z.object({
    amount: z.string().describe("Amount raising (e.g. '$2M seed')"),
    useOfFunds: z.array(z.string()).describe("How capital will be deployed (e.g. '40% engineering', '35% sales')"),
    runway: z.string().describe("How many months of runway this provides (e.g. '18 months')"),
    milestoneToUnlock: z.string().describe("The milestone this capital gets you to (e.g. '$500k ARR to raise Series A')"),
  }).describe("Funding ask details"),
});

type InvestorNarrativeInput = z.infer<typeof investorNarrativeSchema>;

interface InvestorNarrative {
  pitchDeckOutline: PitchSlide[];
  elevatorPitch: string;
  coldEmailTemplate: string;
  vcQaPrep: QAItem[];
  investorThesis: string;
  redFlagsToAddress: string[];
}

interface PitchSlide {
  slide: number;
  title: string;
  keyPoints: string[];
  speakerNote: string;
}

interface QAItem {
  question: string;
  suggestedAnswer: string;
}

export function buildInvestorNarrative(input: InvestorNarrativeInput): ReturnType<typeof toMcpContent> {
  try {
    const narrative: InvestorNarrative = {
      pitchDeckOutline: buildPitchDeck(input),
      elevatorPitch: buildElevatorPitch(input),
      coldEmailTemplate: buildColdEmail(input),
      vcQaPrep: buildQaPrep(input),
      investorThesis: buildInvestorThesis(input),
      redFlagsToAddress: identifyRedFlags(input),
    };
    return toMcpContent(success(narrative));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return toMcpContent(failure(`Investor narrative failed: ${msg}`, "UNKNOWN"));
  }
}

function buildPitchDeck(input: InvestorNarrativeInput): PitchSlide[] {
  return [
    {
      slide: 1,
      title: "Cover",
      keyPoints: [
        input.companyName,
        input.oneLiner,
        `${input.fundingAsk.amount} — [Round type]`,
      ],
      speakerNote: "Say the one-liner out loud before clicking forward. If they nod, you have 10 minutes. If they look confused, you have 2.",
    },
    {
      slide: 2,
      title: "Problem",
      keyPoints: [
        input.problem,
        "Who has this problem and how often",
        "The cost of the status quo — time, money, or risk",
        "Why existing solutions fail",
      ],
      speakerNote: "Make the investor feel the pain. Specific numbers beat adjectives. '$40k lost per enterprise per year' beats 'significant revenue loss'.",
    },
    {
      slide: 3,
      title: "Solution",
      keyPoints: [
        input.solution,
        "Core mechanism — the 'how' in one sentence",
        "3 key differentiators vs. status quo",
        "Optional: 30-second live demo or product screenshot",
      ],
      speakerNote: "Less is more here. Show the output, not the features. Investors fund outcomes.",
    },
    {
      slide: 4,
      title: "Market Size",
      keyPoints: [
        `TAM: ${input.marketSize.tam}`,
        `SAM: ${input.marketSize.sam}`,
        `SOM: ${input.marketSize.som}`,
        "Data source for market estimates",
      ],
      speakerNote: "Bottom-up SAM builds more credibility than top-down TAM. Show the math: [# of potential customers] × [ACV].",
    },
    {
      slide: 5,
      title: "Traction",
      keyPoints: [
        input.traction.revenue ? `Revenue: ${input.traction.revenue}` : "Pre-revenue — design partners engaged",
        input.traction.customers ? `Customers: ${input.traction.customers}` : "",
        input.traction.growth ? `Growth: ${input.traction.growth}` : "",
        ...(input.traction.keyMilestones ?? []).slice(0, 3),
      ].filter(Boolean),
      speakerNote: "Lead with your strongest number. If no revenue yet, lead with customer count or LOIs. Never hide traction — investors find it anyway.",
    },
    {
      slide: 6,
      title: "Business Model",
      keyPoints: [
        input.businessModel,
        "Pricing tiers (if applicable)",
        "Gross margin target",
        "Net Revenue Retention / expansion potential",
      ],
      speakerNote: "Investors want to see a path to 70%+ gross margins and evidence that customers expand, not churn.",
    },
    {
      slide: 7,
      title: "Competition",
      keyPoints: [
        ...input.competition.map((c) => `${c.name}: ${c.weakness}`),
        `${input.companyName} wins because: [your 1 unfair advantage]`,
      ],
      speakerNote: "Never say 'we have no competition'. That signals you don't understand the market. Show you've done the work.",
    },
    {
      slide: 8,
      title: "Team",
      keyPoints: input.team.map((m) => `${m.name} (${m.role}): ${m.credentialHighlight}`),
      speakerNote: "Investors invest in people first. Lead with 'why us' — domain expertise, unfair access, previous exits, or deep personal connection to the problem.",
    },
    {
      slide: 9,
      title: "The Ask",
      keyPoints: [
        `Raising ${input.fundingAsk.amount}`,
        ...input.fundingAsk.useOfFunds,
        `Runway: ${input.fundingAsk.runway}`,
        `This gets us to: ${input.fundingAsk.milestoneToUnlock}`,
      ],
      speakerNote: "Be specific about the milestone this capital unlocks. 'Get to $500k ARR and Series A metrics' is a better close than 'continue growing the business'.",
    },
    {
      slide: 10,
      title: "Why Now",
      keyPoints: [
        "The market or technology shift that makes this the right moment",
        "Why this problem couldn't be solved 5 years ago",
        "The window: why acting now is better than waiting",
      ],
      speakerNote: "The 'why now' is often the most overlooked slide. Nail this and you pre-empt the 'we'd like to see more traction' objection.",
    },
  ];
}

function buildElevatorPitch(input: InvestorNarrativeInput): string {
  const hasTraction = !!(input.traction.revenue || input.traction.customers);
  const tractionStr = hasTraction
    ? ` We're ${input.traction.growth ? `growing at ${input.traction.growth}` : "live"} with ${input.traction.customers ?? input.traction.revenue}.`
    : " We're pre-revenue with early design partners validating the core thesis.";

  return (
    `${input.companyName} — ${input.oneLiner}.\n\n` +
    `The problem: ${input.problem.split(".")[0]}.\n\n` +
    `Our solution: ${input.solution.split(".")[0]}.${tractionStr}\n\n` +
    `The market opportunity is ${input.marketSize.tam}. ` +
    `We're raising ${input.fundingAsk.amount} to ${input.fundingAsk.milestoneToUnlock}.\n\n` +
    `The team: ${input.team.map((m) => `${m.name} (${m.credentialHighlight})`).join(", ")}.\n\n` +
    `[Competition]: Unlike ${input.competition[0]?.name ?? "legacy tools"}, which ${input.competition[0]?.weakness ?? "require heavy implementation"}, ${input.companyName} [key differentiator].\n\n` +
    `Worth 30 minutes to dig in?`
  );
}

function buildColdEmail(input: InvestorNarrativeInput): string {
  const tractionHook = input.traction.revenue
    ? `We're at ${input.traction.revenue} ARR`
    : input.traction.customers
    ? `We have ${input.traction.customers}`
    : "We just closed our first design partners";

  return (
    `Subject: ${input.companyName} — ${input.fundingAsk.amount} raise — intro?\n\n` +
    `[VC Name],\n\n` +
    `${input.companyName} — ${input.oneLiner}.\n\n` +
    `${tractionHook}${input.traction.growth ? `, growing ${input.traction.growth}` : ""}. ` +
    `The market is ${input.marketSize.tam}.\n\n` +
    `We're raising ${input.fundingAsk.amount}. This gets us to ${input.fundingAsk.milestoneToUnlock}.\n\n` +
    `Team: ${input.team.slice(0, 2).map((m) => `${m.name} (${m.credentialHighlight})`).join(", ")}.\n\n` +
    `Would love 20 minutes if this fits your thesis — happy to share the deck.\n\n` +
    `[Your name]\n` +
    `[Your phone / calendly link]`
  );
}

function buildQaPrep(input: InvestorNarrativeInput): QAItem[] {
  return [
    {
      question: "Why hasn't a big company solved this already?",
      suggestedAnswer: `Large incumbents like ${input.competition[0]?.name ?? "existing players"} are optimized for [their segment]. Our ICP is underserved because [reason]. We win on speed, focus, and [differentiator].`,
    },
    {
      question: "What's your CAC and LTV?",
      suggestedAnswer: input.traction.revenue
        ? `Early CAC is $[X] with an estimated LTV of $[Y] based on ${input.businessModel}. We expect CAC to decrease as referrals and content scale.`
        : `We're still establishing baseline CAC data. Our early design partner conversations suggest [acquisition channel] will be our most efficient channel at $[estimate] CAC.`,
    },
    {
      question: "What if [top competitor] copies this?",
      suggestedAnswer: `${input.competition[0]?.name ?? "A large competitor"} copying us validates the market. Our moat is [data network effects / workflow lock-in / team domain expertise / customer relationships]. By the time they ship, we'll be 18 months ahead.`,
    },
    {
      question: "What does your ideal Series A profile look like?",
      suggestedAnswer: `${input.fundingAsk.milestoneToUnlock}. At that point we'd look for a $[X]M Series A to [scale sales / expand internationally / build enterprise tier].`,
    },
    {
      question: "Why now?",
      suggestedAnswer: `Three forces converging: [market shift 1], [technology shift], and [regulatory or buyer behavior change]. This problem existed 5 years ago but the conditions to solve it profitably didn't.`,
    },
    {
      question: "Who else are you talking to?",
      suggestedAnswer: `We're running a focused process — talking to [3–5 firms] that invest in [stage/sector]. We're aiming to close in [timeframe]. Happy to send you our full investor update if you'd like to move quickly.`,
    },
    {
      question: `What happens if you don't hit ${input.fundingAsk.milestoneToUnlock}?`,
      suggestedAnswer: `We have levers: [reduce burn, shift channel mix, go upmarket for larger ACVs]. The milestone is our target, not our only path. We're capital-efficient by design.`,
    },
  ];
}

function buildInvestorThesis(input: InvestorNarrativeInput): string {
  return (
    `Investment Thesis: ${input.companyName}\n\n` +
    `Market: ${input.marketSize.tam} total addressable; ${input.marketSize.sam} realistically capturable.\n\n` +
    `Why ${input.companyName} wins:\n` +
    input.competition.map((c) => `  • vs. ${c.name}: ${c.weakness} — ${input.companyName} addresses this directly`).join("\n") +
    `\n\nTeam conviction:\n` +
    input.team.map((m) => `  • ${m.name} (${m.role}): ${m.credentialHighlight}`).join("\n") +
    `\n\nTraction signal:\n` +
    [
      input.traction.revenue ? `  • Revenue: ${input.traction.revenue}` : null,
      input.traction.customers ? `  • Customers: ${input.traction.customers}` : null,
      input.traction.growth ? `  • Growth: ${input.traction.growth}` : null,
    ].filter(Boolean).join("\n") +
    `\n\nCapital efficiency: ${input.fundingAsk.amount} → ${input.fundingAsk.milestoneToUnlock} in ${input.fundingAsk.runway}.`
  );
}

function identifyRedFlags(input: InvestorNarrativeInput): string[] {
  const flags: string[] = [];

  if (!input.traction.revenue && !input.traction.customers) {
    flags.push("No revenue or paying customers yet — lead with design partners, LOIs, or pilot agreements to reduce perceived risk");
  }
  if (input.competition.length < 2) {
    flags.push("Only 1 competitor listed — investors will probe. Know at least 4 competitors and your differentiated answer for each");
  }
  if (input.team.length < 2) {
    flags.push("Solo founder or single team member listed — address team risk proactively: advisors, plans to hire, domain expertise");
  }
  if (!input.traction.growth) {
    flags.push("No growth rate shown — if you have any MoM growth, show it. Even 10% MoM from a small base signals trajectory");
  }

  const somNumber = input.marketSize.som.match(/\d[\d,]*/);
  const samNumber = input.marketSize.sam.match(/\d[\d,]*/);
  if (somNumber && samNumber) {
    const som = parseInt(somNumber[0].replace(/,/g, ""), 10);
    const sam = parseInt(samNumber[0].replace(/,/g, ""), 10);
    if (sam > 0 && som / sam > 0.10) {
      flags.push("SOM appears high relative to SAM (>10%) — investors will question the achievability; refine the 3-year capture thesis");
    }
  }

  return flags;
}

export const investorNarrativeTool = {
  name: "build_investor_narrative",
  description:
    "Generate a complete investor pitch package — 10-slide deck outline with speaker notes, 3-paragraph elevator pitch, cold VC email template, investor thesis one-pager, 7-question VC Q&A prep, and a red-flag review of your pitch's weak spots. Covers everything a $25k pitch coach would produce.",
} as const;
