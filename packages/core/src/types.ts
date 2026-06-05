import { z } from "zod";

export const AutostackupConfigSchema = z.object({
  apolloApiKey: z.string().optional(),
  hunterApiKey: z.string().optional(),
  serpApiKey: z.string().optional(),
  metaAccessToken: z.string().optional(),
  googleAdsApiKey: z.string().optional(),
});

export type AutostackupConfig = z.infer<typeof AutostackupConfigSchema>;

export interface ToolSuccess<T = unknown> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ToolError {
  ok: false;
  error: string;
  code: ErrorCode;
}

export type ToolResult<T = unknown> = ToolSuccess<T> | ToolError;

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "API_ERROR"
  | "CONFIG_MISSING"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN";

export interface LeadContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company: string;
  title?: string;
  linkedinUrl?: string;
  website?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "prospect",    name: "Prospect",        probability: 5  },
  { id: "qualified",   name: "Qualified",        probability: 20 },
  { id: "discovery",   name: "Discovery",        probability: 35 },
  { id: "proposal",    name: "Proposal Sent",    probability: 55 },
  { id: "negotiation", name: "Negotiation",      probability: 75 },
  { id: "closed_won",  name: "Closed Won",       probability: 100},
  { id: "closed_lost", name: "Closed Lost",      probability: 0  },
];
