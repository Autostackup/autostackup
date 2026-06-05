import { z } from "zod";
import { success, toMcpContent } from "@autostackup/core";

export const audienceSegmentSchema = z.object({
  product: z.string(),
  industry: z.string(),
  currentCustomers: z.array(z.object({
    description: z.string(),
    size: z.enum(["small", "medium", "large"]).optional(),
    avgDealValue: z.number().optional(),
    churnRate: z.number().optional().describe("0-100 percentage"),
  })).optional().describe("Describe existing customer segments if known"),
  geographies: z.array(z.string()),
  b2bOrB2c: z.enum(["b2b", "b2c", "both"]),
  problemSolved: z.string().describe("The core problem your product solves"),
});

type AudienceSegmentInput = z.infer<typeof audienceSegmentSchema>;

export function audienceSegment(input: AudienceSegmentInput) {
  const segments = buildSegments(input);
  const primarySegment = segments[0];
  const personaMap = segments.map(buildPersona);

  return toMcpContent(success({
    product: input.product,
    totalSegments: segments.length,
    recommendedPrimaryFocus: primarySegment?.name ?? "See segments",
    segments: personaMap,
    messagingMatrix: buildMessagingMatrix(segments, input),
    channelRecommendations: buildChannelRecs(input),
  }));
}

function buildSegments(input: AudienceSegmentInput) {
  const base = [
    {
      name: `Early Adopter ${input.b2bOrB2c === "b2b" ? "Companies" : "Consumers"}`,
      priority: 1,
      characteristics: [
        "Actively seeking solutions to the problem",
        "Higher tolerance for new/unproven products",
        input.b2bOrB2c === "b2b" ? "Smaller companies with agile decision-making" : "Tech-forward, trend-aware individuals",
      ],
      painPoints: [input.problemSolved, "Current solutions feel outdated or expensive"],
      buyingTriggers: ["Recent event that made the problem critical", "Recommendation from peer", "Found via search"],
      estimatedMarketSize: "Smaller but highest conversion rate",
    },
    {
      name: `Mainstream ${input.b2bOrB2c === "b2b" ? "Enterprise" : "Mass Market"}`,
      priority: 2,
      characteristics: [
        "Needs social proof before purchasing",
        "Values reliability and support",
        input.b2bOrB2c === "b2b" ? "Established companies with procurement processes" : "Value-conscious, risk-averse buyers",
      ],
      painPoints: [input.problemSolved, "Worried about switching costs", "Needs ROI justification"],
      buyingTriggers: ["Sees 3+ case studies", "Peer companies adopt", "Product becomes industry standard"],
      estimatedMarketSize: "Largest segment — unlock after early adopters",
    },
    {
      name: `Strategic / Partner Segment`,
      priority: 3,
      characteristics: [
        "Uses your product as part of a larger solution",
        "Higher deal values",
        "Longer sales cycles",
      ],
      painPoints: ["Integration requirements", input.problemSolved + " at scale"],
      buyingTriggers: ["Partnership or reseller opportunity", "Volume pricing", "API/integration availability"],
      estimatedMarketSize: "Smaller count, highest ACV",
    },
  ];

  if (input.currentCustomers && input.currentCustomers.length > 0) {
    base.unshift({
      name: "Existing Customer Base (Expand / Upsell)",
      priority: 0,
      characteristics: ["Already trust the product", "Highest conversion rate", "Lowest CAC"],
      painPoints: ["Need more features", "Growing usage beyond current plan"],
      buyingTriggers: ["Reaching usage limits", "New use case emerges", "Account review conversation"],
      estimatedMarketSize: "Your most valuable near-term revenue source",
    });
  }

  return base;
}

function buildPersona(segment: ReturnType<typeof buildSegments>[0]) {
  return {
    ...segment,
    messagingApproach:
      segment.priority === 0
        ? "Upsell / expansion — focus on added value and new ROI"
        : segment.priority === 1
        ? "Problem-led — lead with the pain and position yourself as the obvious fix"
        : segment.priority === 2
        ? "Proof-led — lead with customer outcomes, logos, and data"
        : "Value-led — focus on partnership, integration, and ROI at scale",
  };
}

function buildMessagingMatrix(
  segments: ReturnType<typeof buildSegments>,
  input: AudienceSegmentInput
) {
  return segments.map((s) => ({
    segment: s.name,
    headline: `[Solve ${input.problemSolved.slice(0, 30)}] for ${s.name}`,
    subheadline: s.painPoints[0] ?? "",
    cta: s.priority === 0 ? "See what's new" : s.priority === 1 ? "Start free" : "See case studies",
    proof: s.priority <= 1 ? "Early customer quote / stat" : "Logo wall + outcome metrics",
  }));
}

function buildChannelRecs(input: AudienceSegmentInput) {
  if (input.b2bOrB2c === "b2b") {
    return {
      topChannels: ["LinkedIn Ads", "Google Search (problem-aware keywords)", "Cold email (Apollo/Hunter)"],
      contentStrategy: "Thought leadership, industry reports, ROI calculators",
      communityPlay: "Sponsor or speak at industry conferences and Slack communities",
    };
  }
  if (input.b2bOrB2c === "b2c") {
    return {
      topChannels: ["Meta (Facebook/Instagram)", "TikTok", "Google Shopping / Search"],
      contentStrategy: "UGC, short video, influencer partnerships",
      communityPlay: "Build owned community (Discord, WhatsApp, loyalty program)",
    };
  }
  return {
    topChannels: ["Meta", "Google", "LinkedIn", "Cold email"],
    contentStrategy: "Dual content track: B2C-facing social + B2B-facing thought leadership",
    communityPlay: "Two-sided approach — consumer community + business partner program",
  };
}

export const audienceSegmentTool = {
  name: "segment_audience",
  description:
    "Build a segmented audience map with personas, messaging matrix, and channel recommendations. " +
    "Returns prioritized segments with tailored messaging for each.",
  schema: audienceSegmentSchema,
  handler: audienceSegment,
};
