import { z } from "zod";
import { success, failure, toMcpContent } from "@autostackup/core";

export const weeklyBriefingSchema = z.object({
  weekOf: z.string().describe("Week start date (e.g. 'June 9, 2025')"),
  pipeline: z.object({
    deals: z.array(z.object({
      name: z.string().describe("Deal or prospect name"),
      stage: z.string().describe("Current pipeline stage"),
      value: z.number().describe("Deal value in USD"),
      nextAction: z.string().describe("Next action required"),
      daysInStage: z.number().describe("Days spent in current stage"),
    })).describe("All active pipeline deals"),
    newLeadsThisWeek: z.number().describe("Number of new leads added this week"),
    closedWonThisWeek: z.number().describe("Revenue closed this week in USD"),
  }).describe("Sales pipeline snapshot"),
  marketing: z.object({
    topPerformingContent: z.string().optional().describe("Best performing post or content piece this week"),
    websiteVisits: z.number().optional().describe("Website visits this week"),
    leads: z.number().optional().describe("Marketing qualified leads this week"),
    spend: z.number().optional().describe("Marketing spend this week in USD"),
  }).describe("Marketing metrics"),
  team: z.array(z.object({
    name: z.string().describe("Team member name"),
    role: z.string().describe("Role or title"),
    status: z.string().describe("What they worked on this week and any blockers"),
  })).optional().describe("Team status updates"),
  topChallenges: z.array(z.string()).describe("Top 2–3 challenges or blockers right now"),
  wins: z.array(z.string()).describe("Top wins or positive signals this week"),
});

type WeeklyBriefingInput = z.infer<typeof weeklyBriefingSchema>;

interface WeeklyBriefing {
  weekOf: string;
  executiveSummary: string;
  pipelineHealth: PipelineHealth;
  marketingPulse: MarketingPulse;
  teamSnapshot: TeamItem[];
  topActions: ActionItem[];
  redFlags: RedFlag[];
  weeklyHighlights: string[];
}

interface PipelineHealth {
  totalPipelineValue: number;
  weightedForecast: number;
  stageBreakdown: StageBreakdown[];
  staleDeal: string[];
  closingThisWeek: string[];
  pipelineCoverageNote: string;
}

interface StageBreakdown {
  stage: string;
  count: number;
  value: number;
}

interface MarketingPulse {
  summary: string;
  cpl: string;
  topAction: string;
}

interface TeamItem {
  name: string;
  role: string;
  status: string;
}

interface ActionItem {
  priority: number;
  action: string;
  owner: string;
  dueBy: string;
}

interface RedFlag {
  issue: string;
  impact: string;
  suggestedFix: string;
}

export function buildWeeklyBriefing(input: WeeklyBriefingInput): ReturnType<typeof toMcpContent> {
  try {
    const briefing = assembleBriefing(input);
    return toMcpContent(success(briefing));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return toMcpContent(failure(`Weekly briefing failed: ${msg}`, "UNKNOWN"));
  }
}

function assembleBriefing(input: WeeklyBriefingInput): WeeklyBriefing {
  const totalPipeline = input.pipeline.deals.reduce((sum, d) => sum + d.value, 0);
  const weightedForecast = computeWeightedForecast(input.pipeline.deals);
  const staleDeals = input.pipeline.deals.filter((d) => d.daysInStage > 14).map((d) => d.name);
  const closingThisWeek = input.pipeline.deals
    .filter((d) => d.stage.toLowerCase().includes("clos") || d.stage.toLowerCase().includes("proposal") || d.stage.toLowerCase().includes("negotiat"))
    .map((d) => `${d.name} — $${d.value.toLocaleString()}`);

  const stageMap: Record<string, { count: number; value: number }> = {};
  for (const deal of input.pipeline.deals) {
    const existing = stageMap[deal.stage];
    if (existing === undefined) {
      stageMap[deal.stage] = { count: 1, value: deal.value };
    } else {
      stageMap[deal.stage] = { count: existing.count + 1, value: existing.value + deal.value };
    }
  }
  const stageBreakdown: StageBreakdown[] = Object.entries(stageMap).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value,
  }));

  const redFlags = buildRedFlags(input, staleDeals);
  const topActions = buildTopActions(input, staleDeals, closingThisWeek);

  return {
    weekOf: input.weekOf,
    executiveSummary: buildExecutiveSummary(input, totalPipeline, weightedForecast),
    pipelineHealth: {
      totalPipelineValue: totalPipeline,
      weightedForecast,
      stageBreakdown,
      staleDeal: staleDeals,
      closingThisWeek,
      pipelineCoverageNote: pipelineCoverageNote(totalPipeline),
    },
    marketingPulse: buildMarketingPulse(input),
    teamSnapshot: (input.team ?? []).map((m) => ({ name: m.name, role: m.role, status: m.status })),
    topActions,
    redFlags,
    weeklyHighlights: input.wins,
  };
}

function computeWeightedForecast(deals: WeeklyBriefingInput["pipeline"]["deals"]): number {
  const weights: Record<string, number> = {
    "lead": 0.05, "prospect": 0.10, "discovery": 0.15, "demo": 0.25,
    "proposal": 0.40, "negotiat": 0.60, "verbal": 0.80, "clos": 0.90,
  };
  return Math.round(deals.reduce((sum, deal) => {
    const stage = deal.stage.toLowerCase();
    const weight = Object.entries(weights).find(([key]) => stage.includes(key))?.[1] ?? 0.20;
    return sum + deal.value * weight;
  }, 0));
}

function pipelineCoverageNote(totalPipeline: number): string {
  if (totalPipeline === 0) return "No pipeline — critical: focus all energy on outbound this week";
  if (totalPipeline < 50000) return "Pipeline thin — increase outreach volume immediately";
  if (totalPipeline < 200000) return "Pipeline building — maintain outreach cadence";
  return "Healthy pipeline — focus on advancing deals and shortening cycle";
}

function buildExecutiveSummary(
  input: WeeklyBriefingInput,
  totalPipeline: number,
  weightedForecast: number
): string {
  const closedStr = input.pipeline.closedWonThisWeek > 0
    ? `Closed $${input.pipeline.closedWonThisWeek.toLocaleString()} this week.`
    : "No new closed deals this week.";

  return (
    `Week of ${input.weekOf}\n\n` +
    `${closedStr} Total pipeline: $${totalPipeline.toLocaleString()} (weighted forecast: $${weightedForecast.toLocaleString()}). ` +
    `Added ${input.pipeline.newLeadsThisWeek} new leads. ` +
    (input.marketing.leads ? `Marketing generated ${input.marketing.leads} MQLs. ` : "") +
    `Top challenges: ${input.topChallenges.join("; ")}.`
  );
}

function buildMarketingPulse(input: WeeklyBriefingInput): MarketingPulse {
  const { marketing } = input;
  const cpl =
    marketing.spend && marketing.leads && marketing.leads > 0
      ? `$${Math.round(marketing.spend / marketing.leads)}/lead`
      : "No paid spend tracked";

  const summary =
    [
      marketing.websiteVisits ? `${marketing.websiteVisits.toLocaleString()} site visits` : null,
      marketing.leads ? `${marketing.leads} MQLs` : null,
      marketing.spend ? `$${marketing.spend.toLocaleString()} spent` : null,
      marketing.topPerformingContent ? `Top content: ${marketing.topPerformingContent}` : null,
    ]
      .filter(Boolean)
      .join(" | ") || "No marketing data provided";

  const topAction =
    !marketing.leads || marketing.leads === 0
      ? "Publish 2 pieces of content this week — one LinkedIn post, one longer article"
      : marketing.leads < 5
      ? "Increase content cadence and test 1 paid ad to boost MQL volume"
      : "Scale what's working — double down on top-performing channel";

  return { summary, cpl, topAction };
}

function buildRedFlags(
  input: WeeklyBriefingInput,
  staleDeals: string[]
): RedFlag[] {
  const flags: RedFlag[] = [];

  if (staleDeals.length > 0) {
    flags.push({
      issue: `${staleDeals.length} stale deal(s) stuck >14 days: ${staleDeals.join(", ")}`,
      impact: "Stale pipeline = phantom revenue; distorts forecast and delays cash",
      suggestedFix: "Send a break-up email today. If no response in 48h, mark lost and replace with fresh outreach",
    });
  }

  if (input.pipeline.newLeadsThisWeek < 10) {
    flags.push({
      issue: `Low new lead volume this week (${input.pipeline.newLeadsThisWeek} leads)`,
      impact: "Thin top-of-funnel will stall pipeline in 4–6 weeks",
      suggestedFix: "Block 2 hours daily for outbound: 30 LinkedIn requests + 20 cold emails",
    });
  }

  for (const challenge of input.topChallenges) {
    flags.push({
      issue: challenge,
      impact: "Reported as a top blocker this week",
      suggestedFix: "Escalate or allocate founder time directly — don't let this sit past Thursday",
    });
  }

  return flags;
}

function buildTopActions(
  input: WeeklyBriefingInput,
  staleDeals: string[],
  closingThisWeek: string[]
): ActionItem[] {
  const actions: ActionItem[] = [];
  let priority = 1;

  if (closingThisWeek.length > 0) {
    actions.push({
      priority: priority++,
      action: `Push to close: ${closingThisWeek.slice(0, 2).join(", ")}`,
      owner: "Founder / Sales",
      dueBy: "This week",
    });
  }

  if (staleDeals.length > 0) {
    actions.push({
      priority: priority++,
      action: `Send break-up email to stale deals: ${staleDeals.slice(0, 2).join(", ")}`,
      owner: "Sales",
      dueBy: "Monday",
    });
  }

  if (input.pipeline.newLeadsThisWeek < 10) {
    actions.push({
      priority: priority++,
      action: "Run 100-contact outbound blitz — LinkedIn + email in parallel",
      owner: "Founder",
      dueBy: "Wednesday",
    });
  }

  actions.push({
    priority: priority++,
    action: "Publish 2 content pieces and promote to email list",
    owner: "Marketing",
    dueBy: "Thursday",
  });

  if (input.team && input.team.length > 0) {
    actions.push({
      priority: priority++,
      action: "1:1 check-ins with every team member — unblock before Friday",
      owner: "Founder",
      dueBy: "Friday",
    });
  }

  return actions;
}

export const weeklyBriefingTool = {
  name: "weekly_founder_briefing",
  description:
    "Generate a complete weekly ops briefing for a founder — pipeline health with weighted forecast, stale deal red flags, marketing pulse, team snapshot, and prioritized action list for the week. Replaces the Monday morning board meeting no early-stage founder has time for.",
} as const;
