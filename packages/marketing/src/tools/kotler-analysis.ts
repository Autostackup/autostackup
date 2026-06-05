import { z } from "zod";
import { success, toMcpContent } from "@autostackup/core";

export const kotlerAnalysisSchema = z.object({
  company: z.string(),
  product: z.string().describe("Product or service being marketed"),
  targetMarket: z.string().describe("Primary target market description"),
  currentRevenue: z.number().optional().describe("Current annual revenue USD"),
  marketingBudget: z.number().optional().describe("Annual marketing budget USD"),
  // The 9 Kotler Marketing Mix elements
  product_description: z.string().describe("What the product/service does and its key features"),
  price_strategy: z.string().describe("Current or intended pricing strategy and price points"),
  place_channels: z.array(z.string()).describe("Distribution channels e.g. direct, retail, online, resellers"),
  promotion_current: z.string().describe("Current promotional activities"),
  people: z.string().describe("Key people involved — sales, support, delivery teams"),
  process: z.string().describe("How the product/service is delivered to the customer"),
  physical_evidence: z.string().describe("Tangible proof of quality — packaging, office, website, reviews"),
  positioning: z.string().describe("How you want the brand positioned in the market"),
  performance_metrics: z.string().optional().describe("Current marketing KPIs and their values"),
});

type KotlerAnalysisInput = z.infer<typeof kotlerAnalysisSchema>;

interface ElementScore {
  element: string;
  score: number;
  strength: string;
  gap: string;
  recommendation: string;
}

export function kotlerAnalysis(input: KotlerAnalysisInput) {
  const elements: ElementScore[] = [
    analyzeProduct(input),
    analyzePrice(input),
    analyzePlace(input),
    analyzePromotion(input),
    analyzePeople(input),
    analyzeProcess(input),
    analyzePhysicalEvidence(input),
    analyzePositioning(input),
    analyzePerformance(input),
  ];

  const overallScore = Math.round(elements.reduce((sum, e) => sum + e.score, 0) / elements.length);
  const weakElements = elements.filter((e) => e.score < 60).sort((a, b) => a.score - b.score);
  const strongElements = elements.filter((e) => e.score >= 75);

  const priorityActions = weakElements.slice(0, 3).map((e) => ({
    element: e.element,
    action: e.recommendation,
    urgency: e.score < 40 ? "Critical" : "High",
  }));

  return toMcpContent(success({
    company: input.company,
    product: input.product,
    overallScore,
    rating: overallScore >= 80 ? "Strong" : overallScore >= 60 ? "Developing" : "Needs Work",
    elements,
    strengths: strongElements.map((e) => `${e.element}: ${e.strength}`),
    weaknesses: weakElements.map((e) => `${e.element}: ${e.gap}`),
    priorityActions,
    strategicSummary: buildStrategicSummary(input, overallScore, weakElements),
  }));
}

function analyzeProduct(input: KotlerAnalysisInput): ElementScore {
  const desc = input.product_description;
  const score = desc.length > 100 ? 75 : desc.length > 50 ? 55 : 35;
  return {
    element: "Product",
    score,
    strength: "Core offering is defined",
    gap: score < 60 ? "Product differentiation and feature depth need articulation" : "Clear differentiation needed vs. competitors",
    recommendation: "Document top 3 unique features with customer evidence. Define product-market fit with data.",
  };
}

function analyzePrice(input: KotlerAnalysisInput): ElementScore {
  const strategy = input.price_strategy.toLowerCase();
  const isValueBased = strategy.includes("value") || strategy.includes("premium");
  const hasPricePoints = /\$|\d+/.test(input.price_strategy);
  const score = isValueBased && hasPricePoints ? 80 : hasPricePoints ? 60 : 40;
  return {
    element: "Price",
    score,
    strength: hasPricePoints ? "Price points defined" : "Pricing strategy exists",
    gap: !isValueBased ? "Pricing not anchored to customer value" : !hasPricePoints ? "No concrete price points" : "Consider tiered pricing",
    recommendation: isValueBased
      ? "Validate pricing against willingness-to-pay research. Consider good/better/best tiers."
      : "Shift from cost-plus to value-based pricing. Survey customers on WTP.",
  };
}

function analyzePlace(input: KotlerAnalysisInput): ElementScore {
  const channelCount = input.place_channels.length;
  const hasDigital = input.place_channels.some(
    (c) => c.toLowerCase().includes("online") || c.toLowerCase().includes("digital") || c.toLowerCase().includes("direct")
  );
  const score = channelCount >= 3 && hasDigital ? 80 : channelCount >= 2 ? 65 : 40;
  return {
    element: "Place",
    score,
    strength: `${channelCount} distribution channel(s) active`,
    gap: !hasDigital ? "No digital/direct channel — leaving revenue on the table" : channelCount < 3 ? "Limited channel diversification" : "Channel conflict risk as you scale",
    recommendation: !hasDigital
      ? "Add a direct digital channel (website, marketplace) as highest-margin distribution."
      : "Map channel conflict scenarios and establish clear pricing rules per channel.",
  };
}

function analyzePromotion(input: KotlerAnalysisInput): ElementScore {
  const promo = input.promotion_current.toLowerCase();
  const channels = ["social", "email", "content", "paid", "seo", "pr", "event", "referral"].filter(
    (c) => promo.includes(c)
  );
  const score = channels.length >= 4 ? 80 : channels.length >= 2 ? 60 : 35;
  return {
    element: "Promotion",
    score,
    strength: channels.length > 0 ? `Active on ${channels.join(", ")}` : "Promotional activity exists",
    gap: channels.length < 3 ? "Over-reliant on too few promotional channels" : "Ensure consistent brand message across all channels",
    recommendation: channels.length < 3
      ? "Activate 2 additional channels: content marketing (SEO, long-term) + paid (short-term). Build an editorial calendar."
      : "Audit message consistency across channels. Define a unified campaign theme per quarter.",
  };
}

function analyzePeople(input: KotlerAnalysisInput): ElementScore {
  const people = input.people.toLowerCase();
  const hasSales = people.includes("sales");
  const hasSupport = people.includes("support") || people.includes("success");
  const score = hasSales && hasSupport ? 75 : hasSales || hasSupport ? 55 : 40;
  return {
    element: "People",
    score,
    strength: hasSales ? "Sales team defined" : "Team structure exists",
    gap: !hasSupport ? "Customer success / support not mentioned — retention risk" : "Ensure all customer-facing staff are trained on brand voice",
    recommendation: "Document customer journey touchpoints and assign owner per stage. Train all staff on the brand promise.",
  };
}

function analyzeProcess(input: KotlerAnalysisInput): ElementScore {
  const process = input.process;
  const isDetailed = process.length > 80;
  const score = isDetailed ? 70 : 45;
  return {
    element: "Process",
    score,
    strength: isDetailed ? "Delivery process articulated" : "Process exists",
    gap: !isDetailed ? "Delivery process needs documentation and SLA definition" : "Identify and eliminate friction points in the customer journey",
    recommendation: "Map the full customer journey from first touch to renewal. Instrument each step with a metric.",
  };
}

function analyzePhysicalEvidence(input: KotlerAnalysisInput): ElementScore {
  const evidence = input.physical_evidence.toLowerCase();
  const hasReviews = evidence.includes("review") || evidence.includes("testimonial");
  const hasWebsite = evidence.includes("website") || evidence.includes("web");
  const score = hasReviews && hasWebsite ? 80 : hasReviews || hasWebsite ? 60 : 40;
  return {
    element: "Physical Evidence",
    score,
    strength: hasReviews ? "Social proof / reviews present" : hasWebsite ? "Web presence established" : "Brand identity exists",
    gap: !hasReviews ? "No social proof — major trust barrier for new prospects" : !hasWebsite ? "Website quality needs attention" : "Continue building review volume",
    recommendation: !hasReviews
      ? "Launch a customer review program immediately. Target G2, Capterra, or Google reviews. Aim for 25 reviews in 60 days."
      : "Add case studies to website. Quantify customer outcomes with specific numbers.",
  };
}

function analyzePositioning(input: KotlerAnalysisInput): ElementScore {
  const positioning = input.positioning;
  const hasTarget = positioning.toLowerCase().includes("for ") || positioning.toLowerCase().includes("who ");
  const hasCategory = positioning.length > 30;
  const score = hasTarget && hasCategory ? 75 : hasCategory ? 55 : 35;
  return {
    element: "Positioning",
    score,
    strength: hasCategory ? "Positioning statement exists" : "Market position being defined",
    gap: !hasTarget ? "Positioning lacks a specific target customer — too broad" : "Positioning statement needs sharpening vs. competitors",
    recommendation: "Use the formula: For [target], [product] is the [category] that [differentiator], unlike [alternative]. Test with 10 customers.",
  };
}

function analyzePerformance(input: KotlerAnalysisInput): ElementScore {
  const hasMetrics = !!(input.performance_metrics && input.performance_metrics.length > 10);
  const score = hasMetrics ? 70 : 30;
  return {
    element: "Performance",
    score,
    strength: hasMetrics ? "KPIs being tracked" : "Measurement to be established",
    gap: !hasMetrics
      ? "No marketing KPIs defined — flying blind"
      : "Ensure metrics connect to revenue, not just vanity metrics",
    recommendation: "Track: CAC, LTV, MQL→SQL conversion, NPS, and payback period. Review weekly at leadership level.",
  };
}

function buildStrategicSummary(
  input: KotlerAnalysisInput,
  score: number,
  weakElements: ElementScore[]
): string {
  const top3 = weakElements.slice(0, 3).map((e) => e.element).join(", ");
  return (
    `${input.company}'s marketing mix scores ${score}/100. ` +
    (score >= 75
      ? `The foundation is strong. Focus now shifts to optimization and scaling. `
      : score >= 55
      ? `The fundamentals are in place but several elements need strengthening before scaling spend. `
      : `Core marketing infrastructure needs to be built before investing in growth. `) +
    (top3 ? `Priority areas requiring immediate attention: ${top3}.` : "")
  );
}

export const kotlerAnalysisTool = {
  name: "kotler_analysis",
  description:
    "Analyze a company's marketing strategy using Kotler's 9-element marketing mix framework. " +
    "Returns scores, gaps, and prioritized recommendations for each element.",
  schema: kotlerAnalysisSchema,
  handler: kotlerAnalysis,
};
