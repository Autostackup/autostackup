import { z } from "zod";
import { success, failure } from "@autostackup/core";

const DraftOfferInputSchema = z.object({
  candidateName: z.string().describe("Full name of the candidate"),
  role: z.string().describe("Job title being offered"),
  department: z.string().describe("Department or team"),
  reportingTo: z.string().describe("Manager's name and title"),
  startDate: z.string().describe("Proposed start date (e.g. July 1, 2025)"),
  salary: z.number().describe("Annual base salary in USD"),
  currency: z.string().default("USD").describe("Currency code"),
  equity: z.string().optional().describe("Equity offer if any (e.g. 0.5% vested over 4 years)"),
  bonus: z.string().optional().describe("Bonus structure if any (e.g. 15% annual performance bonus)"),
  benefits: z.array(z.string()).optional().describe("Key benefits to highlight (e.g. health, dental, 401k, remote)"),
  probationPeriod: z.string().optional().describe("Probation period if applicable (e.g. 90 days)"),
  offerExpiryDays: z.number().default(5).describe("Days until offer expires"),
  companyName: z.string().describe("Your company name"),
  companySignatory: z.string().describe("Name and title of person signing the offer"),
  tone: z.enum(["formal", "warm", "startup"]).default("warm").describe("Tone of the offer letter"),
});

type DraftOfferInput = z.infer<typeof DraftOfferInputSchema>;

interface OfferLetterResult {
  subject: string;
  letterBody: string;
  compensationSummary: {
    baseSalary: string;
    equity?: string;
    bonus?: string;
    benefits: string[];
    totalCompEstimate: string;
  };
  expiryDate: string;
  negotiationNotes: string[];
  followUpScript: string;
}

export const draftOfferSchema = DraftOfferInputSchema;

export function draftOffer(input: DraftOfferInput): ReturnType<typeof success> | ReturnType<typeof failure> {
  try {
    const expiryDate = getExpiryDate(input.offerExpiryDays);
    const formattedSalary = formatCurrency(input.salary, input.currency);
    const benefits = input.benefits ?? ["health insurance", "dental & vision", "401(k)", "flexible PTO"];

    const subject = `Offer of Employment — ${input.role} at ${input.companyName}`;

    const openings: Record<string, string> = {
      formal: `Dear ${input.candidateName},\n\nFollowing our recent discussions, ${input.companyName} is pleased to extend a formal offer of employment for the position of ${input.role}.`,
      warm: `Dear ${input.candidateName},\n\nWe are thrilled to offer you the position of ${input.role} at ${input.companyName}. We were genuinely impressed throughout our conversations and believe you will make a significant impact on our team.`,
      startup: `Hey ${input.candidateName},\n\nWe've loved getting to know you through this process — and we're excited to officially offer you the ${input.role} role at ${input.companyName}. We're building something special and we want you in the room.`,
    };

    const closings: Record<string, string> = {
      formal: `We look forward to your acceptance and to welcoming you to ${input.companyName}.\n\nPlease confirm your acceptance by ${expiryDate} by signing and returning this letter.\n\nYours sincerely,`,
      warm: `We're genuinely excited about the prospect of you joining the team. Please don't hesitate to reach out if you have any questions before making your decision.\n\nThis offer is open until ${expiryDate}. We look forward to hearing from you.\n\nWarm regards,`,
      startup: `We'd love to get you started. If you have questions — about the role, the team, the cap table, anything — just reach out directly. We're an open book.\n\nThis offer expires ${expiryDate}. Hope to see you soon.\n\nExcited,`,
    };

    const equityClause = input.equity
      ? `\n\nEquity: Subject to board approval, you will be granted ${input.equity}. Full vesting details will be outlined in your equity agreement.`
      : "";

    const bonusClause = input.bonus
      ? `\n\nVariable Compensation: You will be eligible for ${input.bonus}, based on individual and company performance, paid [quarterly/annually].`
      : "";

    const probationClause = input.probationPeriod
      ? `\n\nProbationary Period: This offer is subject to a ${input.probationPeriod} probationary period, during which performance will be evaluated.`
      : "";

    const benefitsText = benefits.map(b => `  • ${b}`).join("\n");

    const letterBody = `${openings[input.tone]}

Position Details:
  • Role: ${input.role}
  • Department: ${input.department}
  • Reports to: ${input.reportingTo}
  • Start Date: ${input.startDate}
  • Employment Type: Full-time

Compensation Package:
  • Base Salary: ${formattedSalary} per annum${equityClause}${bonusClause}

Benefits:
${benefitsText}${probationClause}

This offer is contingent upon successful completion of reference checks and background verification.

${closings[input.tone]}

${input.companySignatory}
${input.companyName}

---
Please sign below to indicate your acceptance:

Signature: _______________________   Date: _______________

${input.candidateName}`;

    // Estimated total comp
    const bonusEstimate = input.bonus ? estimateBonusValue(input.salary, input.bonus) : 0;
    const totalComp = input.salary + bonusEstimate;

    const compensationSummary = {
      baseSalary: formattedSalary,
      ...(input.equity ? { equity: input.equity } : {}),
      ...(input.bonus ? { bonus: input.bonus } : {}),
      benefits,
      totalCompEstimate: bonusEstimate > 0
        ? `~${formatCurrency(totalComp, input.currency)} OTE (base + bonus)`
        : formattedSalary,
    };

    const negotiationNotes = buildNegotiationNotes(input);
    const followUpScript = buildFollowUpScript(input.candidateName, input.role, expiryDate, input.tone);

    const result: OfferLetterResult = {
      subject,
      letterBody,
      compensationSummary,
      expiryDate,
      negotiationNotes,
      followUpScript,
    };

    return success(result);
  } catch (err) {
    return failure(`Offer draft failed: ${err instanceof Error ? err.message : String(err)}`, "UNKNOWN");
  }
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function getExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function estimateBonusValue(salary: number, bonusDesc: string): number {
  const match = bonusDesc.match(/(\d+)%/);
  if (match?.[1]) return Math.round(salary * (parseInt(match[1]) / 100));
  return 0;
}

function buildNegotiationNotes(input: DraftOfferInput): string[] {
  const notes: string[] = [];
  notes.push("Have a max salary ceiling agreed internally before any counter-offer conversation");
  if (!input.equity) notes.push("Consider offering equity as a lever if candidate counters on salary — especially effective at startups");
  if (!input.bonus) notes.push("A performance bonus is low-risk to offer — it's conditional on results and keeps base lean");
  notes.push("If candidate counters, respond within 24 hours — delays signal hesitation and risk losing them");
  notes.push("Never negotiate via email alone — call first, confirm in writing after");
  return notes;
}

function buildFollowUpScript(name: string, role: string, expiry: string, tone: string): string {
  if (tone === "startup") {
    return `Hey ${name} — just wanted to make sure the offer landed okay and see if you have any questions. We're really excited about you joining as ${role}. The offer is open until ${expiry} — let me know if you want to grab a quick call before then.`;
  }
  if (tone === "formal") {
    return `Dear ${name}, I am following up to confirm you received our offer letter for the ${role} position. Please let me know if you require any clarification. We look forward to your response by ${expiry}.`;
  }
  return `Hi ${name}! Just checking in to make sure you got everything okay and to see if you have any questions about the offer. We're genuinely excited about you joining as ${role} — happy to jump on a call if it would help. The offer is open until ${expiry}.`;
}
