#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { toMcpContent } from "@autostackup/core";

// Sales tools
import {
  qualifyLeadTool, qualifyLeadSchema, qualifyLead,
  enrichLeadTool, enrichLeadSchema, enrichLead,
  trackPipelineTool, trackPipelineSchema, trackPipeline,
  generateOutreachTool, generateOutreachSchema, generateOutreach,
  scoreIcpTool, scoreIcpSchema, scoreIcp,
} from "@autostackup/sales";

// Marketing tools
import {
  kotlerAnalysisTool, kotlerAnalysisSchema, kotlerAnalysis,
  imcPlannerTool, imcPlannerSchema, imcPlanner,
  audienceSegmentTool, audienceSegmentSchema, audienceSegment,
} from "@autostackup/marketing";

// HR tools
import {
  screenCandidateSchema, screenCandidate,
  draftOfferSchema, draftOffer,
  onboardingPlanSchema, createOnboardingPlan,
  interviewKitSchema, buildInterviewKit,
  performanceReviewSchema, buildPerformanceReview,
} from "@autostackup/hr";

// Founder-specific orchestration tools
import {
  launchPlaybookTool, launchPlaybookSchema, buildLaunchPlaybook,
} from "./tools/launch-playbook.js";
import {
  weeklyBriefingTool, weeklyBriefingSchema, buildWeeklyBriefing,
} from "./tools/weekly-briefing.js";
import {
  investorNarrativeTool, investorNarrativeSchema, buildInvestorNarrative,
} from "./tools/investor-narrative.js";

const apolloApiKey = process.env["APOLLO_API_KEY"];
const hunterApiKey = process.env["HUNTER_API_KEY"];

const server = new McpServer({
  name: "@autostackup/founder",
  version: "0.1.0",
});

// ─── SALES (5 tools) ─────────────────────────────────────────────────────────

server.tool(
  qualifyLeadTool.name,
  qualifyLeadTool.description,
  qualifyLeadSchema.shape,
  async (input) => ({ content: qualifyLead(input) })
);

server.tool(
  enrichLeadTool.name,
  enrichLeadTool.description,
  enrichLeadSchema.shape,
  async (input) => ({
    content: await enrichLead(input, {
      ...(hunterApiKey ? { hunterApiKey } : {}),
      ...(apolloApiKey ? { apolloApiKey } : {}),
    }),
  })
);

server.tool(
  trackPipelineTool.name,
  trackPipelineTool.description,
  trackPipelineSchema.shape,
  async (input) => ({ content: trackPipeline(input) })
);

server.tool(
  generateOutreachTool.name,
  generateOutreachTool.description,
  generateOutreachSchema.shape,
  async (input) => ({ content: generateOutreach(input) })
);

server.tool(
  scoreIcpTool.name,
  scoreIcpTool.description,
  scoreIcpSchema.shape,
  async (input) => ({ content: scoreIcp(input) })
);

// ─── MARKETING (3 tools) ─────────────────────────────────────────────────────

server.tool(
  kotlerAnalysisTool.name,
  kotlerAnalysisTool.description,
  kotlerAnalysisSchema.shape,
  async (input) => ({ content: kotlerAnalysis(input) })
);

server.tool(
  imcPlannerTool.name,
  imcPlannerTool.description,
  imcPlannerSchema.shape,
  async (input) => ({ content: imcPlanner(input) })
);

server.tool(
  audienceSegmentTool.name,
  audienceSegmentTool.description,
  audienceSegmentSchema.shape,
  async (input) => ({ content: audienceSegment(input) })
);

// ─── HR (5 tools) ────────────────────────────────────────────────────────────

server.tool(
  "screen_candidate",
  "Score a candidate against a job's required skills, experience, and must-haves. Returns a tier (A/B/C/D), skill gap analysis, salary fit, and exact recommended next step.",
  screenCandidateSchema.shape,
  async (args) => {
    const result = screenCandidate(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "draft_offer_letter",
  "Generate a professional, ready-to-send offer letter with compensation summary, equity and bonus clauses, expiry date, negotiation notes, and a follow-up call script.",
  draftOfferSchema.shape,
  async (args) => {
    const result = draftOffer(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "create_onboarding_plan",
  "Build a complete 30/60/90-day onboarding plan for a new hire. Includes Day 1 checklist, weekly themes, milestone goals, and manager action list.",
  onboardingPlanSchema.shape,
  async (args) => {
    const result = createOnboardingPlan(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "build_interview_kit",
  "Generate a complete interview kit for any role — structured questions by competency, STAR follow-up probes, benchmarks, red flags, scorecard template, and legal reminders.",
  interviewKitSchema.shape,
  async (args) => {
    const result = buildInterviewKit(args);
    return { content: toMcpContent(result) };
  }
);

server.tool(
  "write_performance_review",
  "Write a structured performance review with achievements narrative, development sections, next-period goals, compensation recommendation, and a manager meeting guide.",
  performanceReviewSchema.shape,
  async (args) => {
    const result = buildPerformanceReview(args);
    return { content: toMcpContent(result) };
  }
);

// ─── FOUNDER ORCHESTRATION (3 tools) ─────────────────────────────────────────

server.tool(
  launchPlaybookTool.name,
  launchPlaybookTool.description,
  launchPlaybookSchema.shape,
  async (input) => ({ content: buildLaunchPlaybook(input) })
);

server.tool(
  weeklyBriefingTool.name,
  weeklyBriefingTool.description,
  weeklyBriefingSchema.shape,
  async (input) => ({ content: buildWeeklyBriefing(input) })
);

server.tool(
  investorNarrativeTool.name,
  investorNarrativeTool.description,
  investorNarrativeSchema.shape,
  async (input) => ({ content: buildInvestorNarrative(input) })
);

const transport = new StdioServerTransport();
await server.connect(transport);
