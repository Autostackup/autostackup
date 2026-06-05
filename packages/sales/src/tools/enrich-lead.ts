import { z } from "zod";
import { success, failure, requireConfig, toMcpContent } from "@autostackup/core";

export const enrichLeadSchema = z.object({
  email: z.string().email().optional().describe("Contact email address"),
  domain: z.string().optional().describe("Company domain e.g. acme.com"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  provider: z.enum(["hunter", "apollo"]).default("hunter").describe(
    "Enrichment provider to use. Requires corresponding API key in config."
  ),
});

type EnrichLeadInput = z.infer<typeof enrichLeadSchema>;

export async function enrichLead(
  input: EnrichLeadInput,
  config: { hunterApiKey?: string; apolloApiKey?: string }
) {
  if (input.provider === "hunter") {
    const keyResult = requireConfig(config.hunterApiKey, "HUNTER_API_KEY");
    if (!keyResult.ok) return toMcpContent(keyResult);

    const apiKey = keyResult.value;

    if (!input.email && !input.domain) {
      return toMcpContent(failure("Provide either email or domain for Hunter.io lookup.", "VALIDATION_ERROR"));
    }

    try {
      const url = input.email
        ? `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(input.email)}&api_key=${apiKey}`
        : `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(input.domain!)}&api_key=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) {
        return toMcpContent(failure(`Hunter.io returned ${res.status}: ${res.statusText}`, "API_ERROR"));
      }
      const data = await res.json() as unknown;
      return toMcpContent(success(data, { provider: "hunter" }));
    } catch (err) {
      return toMcpContent(failure(`Hunter.io request failed: ${String(err)}`, "API_ERROR"));
    }
  }

  if (input.provider === "apollo") {
    const keyResult = requireConfig(config.apolloApiKey, "APOLLO_API_KEY");
    if (!keyResult.ok) return toMcpContent(keyResult);

    const apiKey = keyResult.value;

    if (!input.email && !(input.firstName && input.lastName)) {
      return toMcpContent(failure("Provide email OR firstName+lastName for Apollo lookup.", "VALIDATION_ERROR"));
    }

    try {
      const body: Record<string, string> = { api_key: apiKey };
      if (input.email) body["email"] = input.email;
      if (input.firstName) body["first_name"] = input.firstName;
      if (input.lastName) body["last_name"] = input.lastName;
      if (input.domain) body["domain"] = input.domain;

      const res = await fetch("https://api.apollo.io/v1/people/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return toMcpContent(failure(`Apollo returned ${res.status}: ${res.statusText}`, "API_ERROR"));
      }
      const data = await res.json() as unknown;
      return toMcpContent(success(data, { provider: "apollo" }));
    } catch (err) {
      return toMcpContent(failure(`Apollo request failed: ${String(err)}`, "API_ERROR"));
    }
  }

  return toMcpContent(failure("Unknown provider", "VALIDATION_ERROR"));
}

export const enrichLeadTool = {
  name: "enrich_lead",
  description:
    "Enrich a lead's contact and company data using Hunter.io or Apollo.io. " +
    "Requires HUNTER_API_KEY or APOLLO_API_KEY in your MCP environment config.",
  schema: enrichLeadSchema,
  handler: enrichLead,
};
