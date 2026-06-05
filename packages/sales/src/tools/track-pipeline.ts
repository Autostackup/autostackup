import { z } from "zod";
import { success, failure, toMcpContent, PIPELINE_STAGES } from "@autostackup/core";

export const trackPipelineSchema = z.object({
  leads: z.array(z.object({
    id: z.string(),
    name: z.string(),
    company: z.string(),
    dealValue: z.number().describe("Estimated deal value in USD"),
    stage: z.enum([
      "prospect", "qualified", "discovery",
      "proposal", "negotiation", "closed_won", "closed_lost"
    ]),
    lastActivity: z.string().describe("ISO date of last activity"),
    expectedCloseDate: z.string().describe("ISO date of expected close"),
    owner: z.string().optional().describe("Sales rep name"),
    notes: z.string().optional(),
  })).describe("Array of leads in the pipeline"),
  forecastPeriod: z.enum(["month", "quarter", "year"]).default("quarter"),
});

type TrackPipelineInput = z.infer<typeof trackPipelineSchema>;

export function trackPipeline(input: TrackPipelineInput) {
  const now = new Date();

  const enrichedLeads = input.leads.map((lead) => {
    const stage = PIPELINE_STAGES.find((s) => s.id === lead.stage);
    const probability = stage?.probability ?? 0;
    const weightedValue = Math.round(lead.dealValue * (probability / 100));
    const daysUntilClose = Math.round(
      (new Date(lead.expectedCloseDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceActivity = Math.round(
      (now.getTime() - new Date(lead.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isStale = daysSinceActivity > 14 && lead.stage !== "closed_won" && lead.stage !== "closed_lost";
    const isAtRisk = daysUntilClose < 14 && probability < 75;

    return {
      ...lead,
      stageName: stage?.name ?? lead.stage,
      probability,
      weightedValue,
      daysUntilClose,
      daysSinceActivity,
      flags: {
        stale: isStale,
        atRisk: isAtRisk,
        overdue: daysUntilClose < 0 && probability < 100,
      },
    };
  });

  const activeLeads = enrichedLeads.filter(
    (l) => l.stage !== "closed_won" && l.stage !== "closed_lost"
  );
  const wonLeads = enrichedLeads.filter((l) => l.stage === "closed_won");
  const lostLeads = enrichedLeads.filter((l) => l.stage === "closed_lost");

  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.dealValue, 0);
  const weightedForecast = activeLeads.reduce((sum, l) => sum + l.weightedValue, 0);
  const staleLeads = enrichedLeads.filter((l) => l.flags.stale);
  const atRiskLeads = enrichedLeads.filter((l) => l.flags.atRisk);

  const byStage = PIPELINE_STAGES.map((stage) => ({
    stage: stage.name,
    count: enrichedLeads.filter((l) => l.stage === stage.id).length,
    totalValue: enrichedLeads
      .filter((l) => l.stage === stage.id)
      .reduce((sum, l) => sum + l.dealValue, 0),
  }));

  const winRate =
    wonLeads.length + lostLeads.length > 0
      ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100)
      : null;

  const urgentActions = [
    ...staleLeads.map((l) => `Follow up with ${l.name} at ${l.company} — no activity for ${l.daysSinceActivity} days`),
    ...atRiskLeads.map((l) => `${l.name} (${l.company}) closes in ${l.daysUntilClose} days but only ${l.probability}% probability`),
  ];

  return toMcpContent(success({
    summary: {
      totalLeads: input.leads.length,
      activeLeads: activeLeads.length,
      totalPipelineValue,
      weightedForecast,
      winRate,
      forecastPeriod: input.forecastPeriod,
    },
    byStage,
    urgentActions,
    leads: enrichedLeads,
  }));
}

export const trackPipelineTool = {
  name: "track_pipeline",
  description:
    "Analyze a sales pipeline. Returns weighted forecast, stage breakdown, win rate, " +
    "and flags stale or at-risk deals with recommended urgent actions.",
  schema: trackPipelineSchema,
  handler: trackPipeline,
};
