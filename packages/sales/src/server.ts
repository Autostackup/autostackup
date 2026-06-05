#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AutostackupConfigSchema } from "@autostackup/core";

import { qualifyLeadTool, qualifyLeadSchema } from "./tools/qualify-lead.js";
import { enrichLeadTool, enrichLeadSchema } from "./tools/enrich-lead.js";
import { trackPipelineTool, trackPipelineSchema } from "./tools/track-pipeline.js";
import { generateOutreachTool, generateOutreachSchema } from "./tools/generate-outreach.js";
import { scoreIcpTool, scoreIcpSchema } from "./tools/score-icp.js";
import { enrichLead } from "./tools/enrich-lead.js";
import { qualifyLead } from "./tools/qualify-lead.js";
import { trackPipeline } from "./tools/track-pipeline.js";
import { generateOutreach } from "./tools/generate-outreach.js";
import { scoreIcp } from "./tools/score-icp.js";

const config = AutostackupConfigSchema.parse({
  apolloApiKey: process.env["APOLLO_API_KEY"],
  hunterApiKey: process.env["HUNTER_API_KEY"],
});

const server = new McpServer({
  name: "@autostackup/sales",
  version: "0.1.0",
});

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
      ...(config.hunterApiKey ? { hunterApiKey: config.hunterApiKey } : {}),
      ...(config.apolloApiKey ? { apolloApiKey: config.apolloApiKey } : {}),
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

const transport = new StdioServerTransport();
await server.connect(transport);
