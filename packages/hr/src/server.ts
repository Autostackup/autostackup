#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { screenCandidate, screenCandidateSchema } from "./tools/screen-candidate.js";
import { draftOffer, draftOfferSchema } from "./tools/draft-offer.js";
import { createOnboardingPlan, onboardingPlanSchema } from "./tools/onboarding-plan.js";
import { buildInterviewKit, interviewKitSchema } from "./tools/interview-kit.js";
import { buildPerformanceReview, performanceReviewSchema } from "./tools/performance-review.js";
import { toMcpContent } from "@autostackup/core";

const server = new McpServer({
  name: "@autostackup/hr",
  version: "0.1.0",
});

server.tool(
  "screen_candidate",
  "Score a candidate against a job's required skills, experience, and must-haves. Returns a tier (A/B/C/D), skill gap analysis, salary fit, and exact recommended next step. Built on structured competency scoring used by top People teams.",
  screenCandidateSchema.shape,
  async (args) => {
    const result = screenCandidate(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "draft_offer_letter",
  "Generate a professional, ready-to-send offer letter with compensation summary, equity and bonus clauses, expiry date, negotiation notes, and a follow-up call script. Supports formal, warm, and startup tones.",
  draftOfferSchema.shape,
  async (args) => {
    const result = draftOffer(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "create_onboarding_plan",
  "Build a complete 30/60/90-day onboarding plan for a new hire. Includes Day 1 checklist, weekly themes, milestone goals, manager action list, red flag warnings, and a success definition. Adapts for IC, manager, and executive roles.",
  onboardingPlanSchema.shape,
  async (args) => {
    const result = createOnboardingPlan(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "build_interview_kit",
  "Generate a complete interview kit for any role — structured questions by competency, STAR follow-up probes, 'what good looks like' benchmarks, red flags, a scorecard template, legal reminders, and a debrief guide. Covers screening, technical, behavioural, case, panel, and final interviews.",
  interviewKitSchema.shape,
  async (args) => {
    const result = buildInterviewKit(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "write_performance_review",
  "Write a structured performance review with achievements narrative, development sections, next-period goals, compensation recommendation, and a manager meeting guide. Adapts to exceeds/meets/partially meets/does not meet ratings and supports coaching, direct, and formal tones.",
  performanceReviewSchema.shape,
  async (args) => {
    const result = buildPerformanceReview(args);
    return { content: toMcpContent(result) };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
