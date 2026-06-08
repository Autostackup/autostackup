import { z } from "zod";
import { success, failure } from "@autostackup/core";

const PerformanceReviewInputSchema = z.object({
  employeeName: z.string().describe("Employee's full name"),
  role: z.string().describe("Employee's job title"),
  reviewPeriod: z.string().describe("Review period (e.g. H1 2025, Q3 2025, Annual 2024)"),
  manager: z.string().describe("Manager's name"),
  goalsAchieved: z.array(z.string()).describe("Goals or projects the employee completed this period"),
  goalsNotMet: z.array(z.string()).optional().describe("Goals that were missed or partially met"),
  keyStrengths: z.array(z.string()).describe("Top strengths demonstrated this period"),
  developmentAreas: z.array(z.string()).describe("Areas that need improvement"),
  overallRating: z.enum(["exceeds_expectations", "meets_expectations", "partially_meets", "does_not_meet"]).describe("Overall performance rating"),
  compensationAction: z.enum(["merit_increase", "promotion", "no_change", "pip"]).optional().describe("Recommended compensation or status action"),
  nextPeriodGoals: z.array(z.string()).optional().describe("Goals for the next review period"),
  tone: z.enum(["formal", "direct", "coaching"]).default("coaching").describe("Tone of the review"),
});

type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;

interface PerformanceReviewResult {
  employeeName: string;
  role: string;
  reviewPeriod: string;
  overallRating: string;
  ratingLabel: string;
  executiveSummary: string;
  achievementsNarrative: string;
  developmentNarrative: string;
  strengthsSection: string;
  developmentSection: string;
  nextPeriodGoals: string[];
  compensationRecommendation: string;
  reviewMeetingGuide: string[];
  selfReviewPrompts: string[];
}

export const performanceReviewSchema = PerformanceReviewInputSchema;

export function buildPerformanceReview(input: PerformanceReviewInput): ReturnType<typeof success> | ReturnType<typeof failure> {
  try {
    const ratingLabels: Record<string, string> = {
      exceeds_expectations: "Exceeds Expectations — consistently delivers above and beyond",
      meets_expectations: "Meets Expectations — solid performer, delivers on commitments",
      partially_meets: "Partially Meets Expectations — some progress but significant gaps remain",
      does_not_meet: "Does Not Meet Expectations — performance is below the required standard",
    };

    const executiveSummary = buildExecutiveSummary(input);
    const achievementsNarrative = buildAchievementsNarrative(input);
    const developmentNarrative = buildDevelopmentNarrative(input);
    const strengthsSection = buildStrengthsSection(input);
    const developmentSection = buildDevelopmentSection(input);
    const nextPeriodGoals = buildNextPeriodGoals(input);
    const compensationRecommendation = buildCompensationRecommendation(input);
    const reviewMeetingGuide = buildReviewMeetingGuide(input);
    const selfReviewPrompts = buildSelfReviewPrompts(input.overallRating);

    const result: PerformanceReviewResult = {
      employeeName: input.employeeName,
      role: input.role,
      reviewPeriod: input.reviewPeriod,
      overallRating: input.overallRating,
      ratingLabel: ratingLabels[input.overallRating] ?? "Rating pending",
      executiveSummary,
      achievementsNarrative,
      developmentNarrative,
      strengthsSection,
      developmentSection,
      nextPeriodGoals,
      compensationRecommendation,
      reviewMeetingGuide,
      selfReviewPrompts,
    };

    return success(result);
  } catch (err) {
    return failure(`Performance review failed: ${err instanceof Error ? err.message : String(err)}`, "UNKNOWN");
  }
}

function buildExecutiveSummary(input: PerformanceReviewInput): string {
  const ratingPhrases: Record<string, string> = {
    exceeds_expectations: `${input.employeeName} had an outstanding ${input.reviewPeriod}. They consistently exceeded expectations, delivered high-impact work, and raised the bar for those around them.`,
    meets_expectations: `${input.employeeName} had a solid ${input.reviewPeriod}, meeting their core commitments and contributing reliably to the team's outcomes.`,
    partially_meets: `${input.employeeName} made progress in ${input.reviewPeriod} but fell short in key areas. There is clear potential, and a focused development plan will be essential for the next period.`,
    does_not_meet: `${input.employeeName}'s performance in ${input.reviewPeriod} was below the standard required for the ${input.role} role. Significant improvement is needed, and we will work together on a clear improvement plan.`,
  };
  return ratingPhrases[input.overallRating] ?? "";
}

function buildAchievementsNarrative(input: PerformanceReviewInput): string {
  const intro = `During ${input.reviewPeriod}, ${input.employeeName} delivered the following:\n\n`;
  const items = input.goalsAchieved.map(g => `• ${g}`).join("\n");
  const notMet = (input.goalsNotMet ?? []).length > 0
    ? `\n\nThe following goals were not fully achieved:\n\n${input.goalsNotMet?.map(g => `• ${g}`).join("\n")}`
    : "";
  return intro + items + notMet;
}

function buildDevelopmentNarrative(input: PerformanceReviewInput): string {
  if (input.developmentAreas.length === 0) return "No significant development areas identified this period.";
  const tones: Record<string, string> = {
    formal: `The following development areas have been identified for ${input.employeeName} to address in the next period:`,
    direct: `To grow into the next level and close performance gaps, ${input.employeeName} needs to focus on:`,
    coaching: `${input.employeeName} has real strengths to build on. To reach their full potential, the focus for the next period should be:`,
  };
  const intro = tones[input.tone] ?? tones["coaching"];
  return `${intro}\n\n${input.developmentAreas.map(a => `• ${a}`).join("\n")}`;
}

function buildStrengthsSection(input: PerformanceReviewInput): string {
  const strengthPhrases: Record<string, string> = {
    formal: `${input.employeeName} demonstrated the following strengths during ${input.reviewPeriod}:`,
    direct: `What ${input.employeeName} does well — and should keep doing:`,
    coaching: `${input.employeeName}'s standout strengths this period — these are genuine differentiators:`,
  };
  const intro = strengthPhrases[input.tone] ?? strengthPhrases["coaching"];
  return `${intro}\n\n${input.keyStrengths.map(s => `• ${s}`).join("\n")}`;
}

function buildDevelopmentSection(input: PerformanceReviewInput): string {
  if (input.developmentAreas.length === 0) return "";
  return input.developmentAreas.map(area => (
    `Development Area: ${area}\n` +
    `Action: Identify 1–2 concrete projects or learning activities this quarter that directly address this\n` +
    `Support: Manager will provide feedback and check-in monthly on progress\n`
  )).join("\n");
}

function buildNextPeriodGoals(input: PerformanceReviewInput): string[] {
  if (input.nextPeriodGoals && input.nextPeriodGoals.length > 0) {
    return input.nextPeriodGoals;
  }
  // Auto-generate based on unmet goals + development areas
  const goals: string[] = [];
  if ((input.goalsNotMet ?? []).length > 0) {
    goals.push(`Complete or make significant progress on: ${input.goalsNotMet?.[0]}`);
  }
  if (input.developmentAreas.length > 0) {
    goals.push(`Measurably improve in: ${input.developmentAreas[0]}`);
  }
  goals.push("Agree on and document 3 specific, measurable goals for next quarter with manager by end of Month 1");
  return goals;
}

function buildCompensationRecommendation(input: PerformanceReviewInput): string {
  if (!input.compensationAction) return "No compensation action specified. Recommend discussing with HR and leadership based on budget cycle and performance tier.";
  const recommendations: Record<string, string> = {
    merit_increase: `Recommended for merit increase. ${input.employeeName}'s performance warrants recognition. Work with HR to confirm the range aligned to their band and market data.`,
    promotion: `Recommended for promotion. ${input.employeeName} is operating above their current level. Prepare a promotion case for the next calibration cycle — document specific examples of above-level impact.`,
    no_change: `No compensation change recommended this cycle. Communicate this clearly and explain the path to a merit increase next review.`,
    pip: `Performance Improvement Plan (PIP) recommended. Work with HR immediately to document the PIP — clear goals, timeline, check-in cadence, and consequences. This conversation requires HR present.`,
  };
  return recommendations[input.compensationAction] ?? "";
}

function buildReviewMeetingGuide(input: PerformanceReviewInput): string[] {
  const guide = [
    "Share the written review 48 hours before the meeting — do not surprise them in the room",
    "Start by asking: 'How are you feeling about the period overall?' — listen before you speak",
    "Walk through achievements first, before development areas — always",
    "Be specific — 'your communication needs work' is not feedback. Name the incident.",
    "Ask: 'What support do you need from me to hit these goals next period?'",
    "End with: 'Is there anything about my feedback you disagree with or want to discuss further?'",
  ];
  if (input.overallRating === "does_not_meet" || input.compensationAction === "pip") {
    guide.push("Have HR present for this conversation", "Document everything — decisions, commitments, timelines", "Follow up in writing within 24 hours with a summary of what was agreed");
  }
  if (input.compensationAction === "promotion" || input.compensationAction === "merit_increase") {
    guide.push("Share the comp decision in the meeting, not before — avoid leaks", "Explain the decision clearly — what drove it and what it recognises");
  }
  return guide;
}

function buildSelfReviewPrompts(rating: string): string[] {
  return [
    "What are you most proud of this period? Be specific — what did you personally do?",
    "What goal or project didn't go as planned, and why? What would you do differently?",
    "What's one thing you want to get better at next period, and how will you do it?",
    "How have you contributed to the team's culture and performance beyond your own work?",
    "What support do you need from your manager that you're not currently getting?",
    ...(rating === "does_not_meet" ? ["What do you think is holding you back from performing at the required level?"] : []),
    ...(rating === "exceeds_expectations" ? ["What's the next challenge you're ready to take on?"] : []),
  ];
}
