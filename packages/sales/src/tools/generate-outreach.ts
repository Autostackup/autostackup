import { z } from "zod";
import { success, toMcpContent } from "@autostackup/core";

export const generateOutreachSchema = z.object({
  prospect: z.object({
    firstName: z.string(),
    lastName: z.string(),
    title: z.string(),
    company: z.string(),
    industry: z.string(),
  }),
  channel: z.enum(["email", "linkedin", "sms"]).default("email"),
  tone: z.enum(["formal", "conversational", "bold"]).default("conversational"),
  valueProposition: z.string().describe("Your core value prop — what problem you solve"),
  senderName: z.string().describe("Your name"),
  senderTitle: z.string().describe("Your title or role"),
  painPoint: z.string().optional().describe("Specific pain point you know this prospect has"),
  socialProof: z.string().optional().describe("Relevant case study, client, or stat to mention"),
  callToAction: z.enum([
    "15-min call",
    "demo",
    "reply with interest",
    "visit website",
  ]).default("15-min call"),
});

type GenerateOutreachInput = z.infer<typeof generateOutreachSchema>;

export function generateOutreach(input: GenerateOutreachInput) {
  const { prospect, channel, tone, valueProposition, senderName, senderTitle } = input;

  const subjectLines = buildSubjectLines(prospect, tone);
  const body = buildBody(input);
  const followUp = buildFollowUp(input);
  const linkedinNote = channel === "linkedin" ? buildLinkedinNote(input) : null;

  return toMcpContent(success({
    channel,
    tone,
    subjectLines,
    body,
    followUp,
    ...(linkedinNote ? { linkedinConnectionNote: linkedinNote } : {}),
    tips: getTips(channel, tone),
    wordCount: body.split(" ").length,
  }));
}

function buildSubjectLines(prospect: GenerateOutreachInput["prospect"], tone: string): string[] {
  return [
    `Quick question, ${prospect.firstName}`,
    `${prospect.company} + [Your Company] — worth 15 minutes?`,
    `How ${prospect.industry} leaders are solving [problem]`,
    tone === "bold"
      ? `I think we can help ${prospect.company} grow 30%`
      : `An idea for ${prospect.company}`,
  ];
}

function buildBody(input: GenerateOutreachInput): string {
  const { prospect, tone, valueProposition, senderName, senderTitle, painPoint, socialProof, callToAction } = input;

  const opener =
    tone === "formal"
      ? `Dear ${prospect.firstName},\n\nI hope this message finds you well.`
      : tone === "bold"
      ? `${prospect.firstName} — I'll keep this short.`
      : `Hi ${prospect.firstName},`;

  const hook = painPoint
    ? `\n\nMany ${prospect.title}s at ${prospect.industry} companies tell me that ${painPoint}.`
    : `\n\nI work with ${prospect.industry} companies like ${prospect.company} to solve a common challenge.`;

  const value = `\n\n${valueProposition}`;

  const proof = socialProof
    ? `\n\n${socialProof}`
    : "";

  const cta =
    callToAction === "15-min call"
      ? `\n\nWould you be open to a 15-minute call this week to explore if this is relevant for ${prospect.company}?`
      : callToAction === "demo"
      ? `\n\nI'd love to show you a quick demo tailored to ${prospect.company}. Worth 20 minutes?`
      : callToAction === "reply with interest"
      ? `\n\nIf this resonates, just reply and I'll send over more detail.`
      : `\n\nYou can learn more at [your website URL].`;

  const closing =
    tone === "formal"
      ? `\n\nKind regards,\n${senderName}\n${senderTitle}`
      : `\n\nBest,\n${senderName}\n${senderTitle}`;

  return `${opener}${hook}${value}${proof}${cta}${closing}`;
}

function buildFollowUp(input: GenerateOutreachInput): string {
  const { prospect, senderName } = input;
  return (
    `Hi ${prospect.firstName},\n\n` +
    `Wanted to bump this up in case it got buried. I know your inbox is busy.\n\n` +
    `My original note was about [one-line summary]. If now isn't the right time, ` +
    `I'm happy to reconnect in a month — just say the word.\n\n` +
    `Best,\n${senderName}`
  );
}

function buildLinkedinNote(input: GenerateOutreachInput): string {
  const { prospect, valueProposition } = input;
  const note = `Hi ${prospect.firstName}, I work with ${prospect.industry} leaders on ${valueProposition.slice(0, 80)}. Would love to connect.`;
  return note.slice(0, 300);
}

function getTips(channel: string, tone: string): string[] {
  const tips: string[] = [
    "Personalize the opener with a recent company milestone or LinkedIn post",
    "Send Tuesday–Thursday between 9–11am local time for best open rates",
  ];
  if (channel === "email") tips.push("A/B test subject lines — test the bold version vs. the question format");
  if (tone === "bold") tips.push("Bold tone works best when you have concrete social proof to back it up");
  if (channel === "linkedin") tips.push("Connect first, wait 24h, then send the message — not both at once");
  return tips;
}

export const generateOutreachTool = {
  name: "generate_outreach",
  description:
    "Generate personalized sales outreach for email, LinkedIn, or SMS. " +
    "Returns subject line variants, body copy, a follow-up, and channel-specific tips.",
  schema: generateOutreachSchema,
  handler: generateOutreach,
};
