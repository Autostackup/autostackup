#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { kotlerAnalysisTool, kotlerAnalysisSchema } from "./tools/kotler-analysis.js";
import { imcPlannerTool, imcPlannerSchema } from "./tools/imc-planner.js";
import { audienceSegmentTool, audienceSegmentSchema } from "./tools/audience-segment.js";
import { kotlerAnalysis } from "./tools/kotler-analysis.js";
import { imcPlanner } from "./tools/imc-planner.js";
import { audienceSegment } from "./tools/audience-segment.js";

const server = new McpServer({
  name: "@autostackup/marketing",
  version: "0.1.0",
});

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

const transport = new StdioServerTransport();
await server.connect(transport);
