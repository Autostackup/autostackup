import { z } from "zod";
import { success, toMcpContent } from "@autostackup/core";

export const scoreIcpSchema = z.object({
  icp: z.object({
    targetIndustries: z.array(z.string()).describe("Industries you sell into"),
    targetCompanySizes: z.array(z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])),
    targetTitles: z.array(z.string()).describe("Job titles of decision makers"),
    targetGeographies: z.array(z.string()).describe("Countries or regions"),
    mustHaveAttributes: z.array(z.string()).optional().describe("Deal-breaker requirements"),
    niceToHaveAttributes: z.array(z.string()).optional(),
  }),
  prospect: z.object({
    industry: z.string(),
    companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
    contactTitle: z.string(),
    geography: z.string(),
    attributes: z.array(z.string()).optional().describe("Known attributes of this prospect"),
  }),
});

type ScoreIcpInput = z.infer<typeof scoreIcpSchema>;

export function scoreIcp(input: ScoreIcpInput) {
  const { icp, prospect } = input;

  const industryMatch = icp.targetIndustries.some(
    (i) => prospect.industry.toLowerCase().includes(i.toLowerCase())
  );
  const sizeMatch = icp.targetCompanySizes.includes(prospect.companySize);
  const titleMatch = icp.targetTitles.some(
    (t) => prospect.contactTitle.toLowerCase().includes(t.toLowerCase())
  );
  const geoMatch = icp.targetGeographies.some(
    (g) => prospect.geography.toLowerCase().includes(g.toLowerCase())
  );

  const mustHaveMatches = icp.mustHaveAttributes
    ? icp.mustHaveAttributes.filter((attr) =>
        prospect.attributes?.some((a) => a.toLowerCase().includes(attr.toLowerCase()))
      )
    : [];

  const mustHaveFails = icp.mustHaveAttributes
    ? icp.mustHaveAttributes.filter(
        (attr) => !prospect.attributes?.some((a) => a.toLowerCase().includes(attr.toLowerCase()))
      )
    : [];

  let score = 0;
  if (industryMatch) score += 30;
  if (sizeMatch) score += 25;
  if (titleMatch) score += 25;
  if (geoMatch) score += 10;
  if (icp.mustHaveAttributes && mustHaveMatches.length === icp.mustHaveAttributes.length) score += 10;

  const disqualified = mustHaveFails.length > 0;

  return toMcpContent(success({
    score: disqualified ? 0 : score,
    disqualified,
    disqualificationReasons: mustHaveFails,
    tier: disqualified ? "DQ" : score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D",
    breakdown: { industryMatch, sizeMatch, titleMatch, geoMatch, mustHaveMatches },
    recommendation: disqualified
      ? "Disqualified — does not meet must-have criteria. Do not invest further."
      : score >= 70
      ? "Strong ICP fit — prioritize for outreach."
      : score >= 50
      ? "Moderate fit — worth pursuing with tailored messaging."
      : "Weak fit — low priority unless self-sourced inbound.",
  }));
}

export const scoreIcpTool = {
  name: "score_icp",
  description:
    "Score a prospect against your Ideal Customer Profile (ICP). " +
    "Returns a fit score, tier, breakdown, and disqualification flags.",
  schema: scoreIcpSchema,
  handler: scoreIcp,
};
