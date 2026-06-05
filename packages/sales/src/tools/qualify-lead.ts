import { z } from "zod";
import { success, failure, toMcpContent } from "@autostackup/core";

export const qualifyLeadSchema = z.object({
  company: z.string().describe("Company name"),
  industry: z.string().describe("Industry / vertical"),
  employeeCount: z.number().optional().describe("Number of employees"),
  annualRevenue: z.number().optional().describe("Estimated annual revenue in USD"),
  budget: z.string().optional().describe("Budget range or confirmed budget"),
  authority: z.string().describe("Who is the decision maker and their title"),
  need: z.string().describe("The pain point or business need driving this deal"),
  timeline: z.string().describe("Buying timeline or urgency"),
  currentSolution: z.string().optional().describe("What they currently use"),
  competitorsConsidered: z.array(z.string()).optional().describe("Other vendors being evaluated"),
});

type QualifyLeadInput = z.infer<typeof qualifyLeadSchema>;

interface QualificationResult {
  bantScore: number;
  meddicScore: number;
  overallScore: number;
  tier: "A" | "B" | "C" | "D";
  recommendation: string;
  strengths: string[];
  gaps: string[];
  suggestedNextStep: string;
}

export function qualifyLead(input: QualifyLeadInput) {
  const bant = scoreBant(input);
  const meddic = scoreMeddic(input);
  const overall = Math.round((bant * 0.4) + (meddic * 0.6));

  const tier =
    overall >= 80 ? "A" :
    overall >= 60 ? "B" :
    overall >= 40 ? "C" : "D";

  const strengths: string[] = [];
  const gaps: string[] = [];

  if (input.budget) strengths.push("Budget confirmed or discussed");
  else gaps.push("Budget not established — qualify early");

  if (input.authority.toLowerCase().includes("ceo") ||
      input.authority.toLowerCase().includes("vp") ||
      input.authority.toLowerCase().includes("director") ||
      input.authority.toLowerCase().includes("head")) {
    strengths.push("Decision maker identified at senior level");
  } else {
    gaps.push("May not have access to final decision maker");
  }

  if (input.need.length > 20) strengths.push("Clear business need articulated");
  else gaps.push("Pain point needs deeper discovery");

  const timelineLower = input.timeline.toLowerCase();
  if (timelineLower.includes("month") || timelineLower.includes("quarter") || timelineLower.includes("week")) {
    strengths.push("Defined buying timeline");
  } else {
    gaps.push("Timeline is vague — establish urgency in next call");
  }

  if (input.competitorsConsidered && input.competitorsConsidered.length > 0) {
    gaps.push(`Competing against: ${input.competitorsConsidered.join(", ")} — prepare differentiation`);
  }

  const recommendation =
    tier === "A" ? "High priority — move to proposal stage immediately." :
    tier === "B" ? "Solid lead — continue discovery, address gaps before proposing." :
    tier === "C" ? "Needs nurturing — address qualification gaps before investing heavily." :
    "Low fit — consider deprioritizing or passing to a partner channel.";

  const suggestedNextStep =
    tier === "A" ? "Schedule executive alignment call and begin proposal draft." :
    tier === "B" ? "Schedule deep-dive discovery call to close qualification gaps." :
    tier === "C" ? "Send relevant case studies and schedule a follow-up in 30 days." :
    "Add to nurture sequence and revisit in 90 days.";

  const result: QualificationResult = {
    bantScore: bant,
    meddicScore: meddic,
    overallScore: overall,
    tier,
    recommendation,
    strengths,
    gaps,
    suggestedNextStep,
  };

  return toMcpContent(success(result));
}

function scoreBant(input: QualifyLeadInput): number {
  let score = 0;
  if (input.budget) score += 25;
  if (input.authority) score += 25;
  if (input.need && input.need.length > 10) score += 25;
  const tl = input.timeline.toLowerCase();
  if (tl.includes("week") || tl.includes("month")) score += 25;
  else if (tl.includes("quarter") || tl.includes("year")) score += 15;
  return score;
}

function scoreMeddic(input: QualifyLeadInput): number {
  let score = 0;
  if (input.annualRevenue || input.employeeCount) score += 20; // Metrics
  if (input.authority) score += 20;                            // Economic buyer
  if (input.need.length > 20) score += 20;                    // Identified pain
  if (input.currentSolution) score += 20;                     // Decision criteria proxy
  if (input.timeline.toLowerCase().includes("month") ||
      input.timeline.toLowerCase().includes("week")) score += 20; // Paper process / timing
  return score;
}

export const qualifyLeadTool = {
  name: "qualify_lead",
  description:
    "Score and qualify a sales lead using both BANT and MEDDIC frameworks. " +
    "Returns a tier (A/B/C/D), gap analysis, and recommended next step.",
  schema: qualifyLeadSchema,
  handler: qualifyLead,
};
