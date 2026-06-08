import { z } from "zod";
import { success, failure } from "@autostackup/core";

const InterviewKitInputSchema = z.object({
  role: z.string().describe("Job title being interviewed for"),
  level: z.enum(["junior", "mid", "senior", "lead", "director", "vp", "cxo"]).describe("Seniority level"),
  department: z.enum(["engineering", "sales", "marketing", "hr", "finance", "operations", "product", "design", "legal", "other"]).describe("Department"),
  coreCompetencies: z.array(z.string()).optional().describe("Key competencies to assess (e.g. leadership, technical depth, customer empathy)"),
  mustAssess: z.array(z.string()).optional().describe("Specific skills or situations that must be probed"),
  interviewType: z.enum(["screening", "technical", "behavioural", "case", "panel", "final"]).default("behavioural").describe("Type of interview"),
  companyStage: z.enum(["early_startup", "growth", "enterprise"]).default("growth").describe("Company stage — shapes the culture-fit questions"),
});

type InterviewKitInput = z.infer<typeof InterviewKitInputSchema>;

interface InterviewQuestion {
  competency: string;
  question: string;
  followUps: string[];
  whatGoodLooksLike: string;
  redFlags: string[];
}

interface InterviewKitResult {
  role: string;
  interviewType: string;
  duration: string;
  structureGuide: string[];
  openingScript: string;
  questions: InterviewQuestion[];
  closingScript: string;
  scorecardTemplate: ScorecardRow[];
  debriefGuide: string[];
  legalReminders: string[];
}

interface ScorecardRow {
  competency: string;
  rating: string;
  notes: string;
}

export const interviewKitSchema = InterviewKitInputSchema;

export function buildInterviewKit(input: InterviewKitInput): ReturnType<typeof success> | ReturnType<typeof failure> {
  try {
    const competencies = input.coreCompetencies ?? getDefaultCompetencies(input.department, input.level);
    const questions = buildQuestions(input, competencies);
    const structureGuide = buildStructureGuide(input.interviewType);
    const scorecardTemplate = competencies.map(c => ({ competency: c, rating: "[ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5", notes: "" }));

    const result: InterviewKitResult = {
      role: input.role,
      interviewType: input.interviewType,
      duration: getDuration(input.interviewType),
      structureGuide,
      openingScript: buildOpeningScript(input.role, input.interviewType),
      questions,
      closingScript: buildClosingScript(input.companyStage),
      scorecardTemplate,
      debriefGuide: buildDebriefGuide(),
      legalReminders: getLegalReminders(),
    };

    return success(result);
  } catch (err) {
    return failure(`Interview kit failed: ${err instanceof Error ? err.message : String(err)}`, "UNKNOWN");
  }
}

function getDefaultCompetencies(department: string, level: string): string[] {
  const isLeader = ["lead", "director", "vp", "cxo"].includes(level);
  const base: Record<string, string[]> = {
    engineering: ["Technical depth", "Problem solving", "Code quality", "Collaboration", ...(isLeader ? ["Engineering leadership", "Cross-functional influence"] : [])],
    sales: ["Pipeline discipline", "Objection handling", "Customer empathy", "Closing ability", ...(isLeader ? ["Team coaching", "Revenue strategy"] : [])],
    marketing: ["Strategic thinking", "Data fluency", "Creative judgment", "Channel expertise", ...(isLeader ? ["Brand leadership", "Budget management"] : [])],
    hr: ["People judgment", "Conflict resolution", "Policy knowledge", "Empathy", ...(isLeader ? ["Org design", "Culture building"] : [])],
    product: ["Customer insight", "Prioritisation", "Data-driven decisions", "Stakeholder management", ...(isLeader ? ["Product vision", "Team leadership"] : [])],
    design: ["Design thinking", "User empathy", "Visual craft", "Feedback handling", ...(isLeader ? ["Design system ownership", "Creative direction"] : [])],
    finance: ["Analytical rigour", "Attention to detail", "Business acumen", "Integrity"],
    operations: ["Process thinking", "Problem solving", "Execution discipline", "Stakeholder management"],
    other: ["Communication", "Problem solving", "Adaptability", "Ownership mindset"],
  };
  return base[department] ?? base["other"] ?? ["Communication", "Problem solving", "Ownership mindset"];
}

function buildQuestions(input: InterviewKitInput, competencies: string[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  // Core behavioural questions per competency
  for (const competency of competencies.slice(0, 5)) {
    questions.push(buildCompetencyQuestion(competency, input.level, input.department));
  }

  // Must-assess probes
  if (input.mustAssess) {
    for (const topic of input.mustAssess.slice(0, 3)) {
      questions.push({
        competency: "Specific Probe",
        question: `Walk me through a specific situation where you had to deal with ${topic}. What was the context, what did you do, and what was the outcome?`,
        followUps: [
          "What would you do differently now?",
          "How did others react to your approach?",
          "What did this teach you?",
        ],
        whatGoodLooksLike: `Clear STAR structure. Takes ownership. Shows learning. Has specifics — not vague generalisations about ${topic}.`,
        redFlags: ["Can't think of an example", "Blames others entirely", "No measurable outcome", "Vague and hypothetical"],
      });
    }
  }

  // Stage-specific culture fit question
  const cultureQuestion = getCultureQuestion(input.companyStage, input.level);
  questions.push(cultureQuestion);

  return questions;
}

function buildCompetencyQuestion(competency: string, level: string, department: string): InterviewQuestion {
  const isLeader = ["lead", "director", "vp", "cxo"].includes(level);
  const questionMap: Record<string, InterviewQuestion> = {
    "Technical depth": {
      competency: "Technical depth",
      question: "Walk me through the most technically complex problem you've solved in the last 12 months. What made it hard, and how did you approach it?",
      followUps: ["What alternatives did you consider?", "How did you validate your solution?", "What would you do differently?"],
      whatGoodLooksLike: "Can explain complexity clearly to a non-expert. Shows systematic thinking. Has trade-off awareness. Shows intellectual humility.",
      redFlags: ["Can't explain it simply", "No trade-off consideration", "Claims sole credit for team work"],
    },
    "Problem solving": {
      competency: "Problem solving",
      question: "Tell me about a time you had to solve a problem where you had incomplete information. How did you decide what to do?",
      followUps: ["What information would have changed your decision?", "How did you communicate uncertainty to stakeholders?", "What was the outcome?"],
      whatGoodLooksLike: "Comfortable with ambiguity. Makes structured decisions with incomplete data. Communicates clearly under uncertainty.",
      redFlags: ["Paralysed without full information", "Doesn't communicate uncertainty", "Jumps to solutions without diagnosis"],
    },
    "Pipeline discipline": {
      competency: "Pipeline discipline",
      question: "Walk me through how you manage your pipeline on a week-by-week basis. What does your qualification process look like?",
      followUps: ["How do you decide where to spend your time?", "How do you handle deals that have gone quiet?", "What's your forecasting accuracy typically like?"],
      whatGoodLooksLike: "Has a clear, repeatable system. Uses a framework (BANT, MEDDIC, or equivalent). Honest about losses. Data-driven.",
      redFlags: ["No clear process", "Can't explain how they prioritise", "Never loses deals 'in their mind'"],
    },
    "Customer empathy": {
      competency: "Customer empathy",
      question: "Tell me about a time you advocated for the customer against internal pressure to do something different. What happened?",
      followUps: ["How did you make the case internally?", "What was the outcome for the customer?", "Do you regret any aspect of how you handled it?"],
      whatGoodLooksLike: "Has a real example. Can balance customer needs with business reality. Shows genuine curiosity about customers.",
      redFlags: ["No clear example", "Treats customers as a category, not individuals", "Can't balance customer vs. business needs"],
    },
    "Engineering leadership": {
      competency: "Engineering leadership",
      question: "Tell me about a time you had to change how your engineering team worked — a process, culture, or technical decision. How did you approach getting buy-in?",
      followUps: ["Who pushed back and why?", "How did you handle the resistance?", "What would you do differently?"],
      whatGoodLooksLike: "Leads through influence, not authority. Has concrete examples. Acknowledges failure or partial success honestly.",
      redFlags: ["Changes things by decree", "Can't recall examples of resistance", "Takes all credit"],
    },
    "Strategic thinking": {
      competency: "Strategic thinking",
      question: `Tell me about a strategic decision you influenced or made in your last role — something that had a meaningful impact on the direction of the ${department} function.`,
      followUps: ["What data informed that decision?", "What did you get wrong?", "How did you communicate it to stakeholders?"],
      whatGoodLooksLike: "Thinks in systems. Has a point of view. Can connect tactics to strategy. Intellectually honest about what didn't work.",
      redFlags: ["Can't distinguish strategy from tactics", "No data to support decisions", "Only describes successes"],
    },
    "People judgment": {
      competency: "People judgment",
      question: "Tell me about the hardest performance conversation you've had. What made it hard, and how did you handle it?",
      followUps: ["What was the outcome for the person?", "What would you do differently?", "How did you prepare?"],
      whatGoodLooksLike: "Direct but empathetic. Has a real example. Shows respect for the individual while being honest.",
      redFlags: ["Avoids the question with a 'positive' example", "No accountability for outcome", "Too clinical or too emotional"],
    },
    "Design thinking": {
      competency: "Design thinking",
      question: "Walk me through a design decision where the data said one thing and your instincts said another. What did you do?",
      followUps: ["How did you resolve the tension?", "What was the outcome?", "What did you learn?"],
      whatGoodLooksLike: "Balances intuition with evidence. Has a principled approach to resolving ambiguity. Owns the outcome.",
      redFlags: ["Always defers to data or always overrides it", "No framework for resolution", "Blames users when design fails"],
    },
  };

  return questionMap[competency] ?? {
    competency,
    question: `Tell me about a time you demonstrated strong ${competency.toLowerCase()}. What was the situation, what did you do, and what was the outcome?`,
    followUps: ["What made this particularly challenging?", "What would you do differently?", "How did others respond?"],
    whatGoodLooksLike: `Clear STAR structure. Specific example. Measurable outcome. Self-awareness about what could improve.`,
    redFlags: ["Vague or hypothetical answer", "No ownership of the outcome", "Can't articulate what they learned"],
  };
}

function getCultureQuestion(stage: string, level: string): InterviewQuestion {
  if (stage === "early_startup") {
    return {
      competency: "Startup fit",
      question: "Describe a time you had to build something from scratch with no playbook, limited resources, and changing requirements. How did you operate?",
      followUps: ["What did you ship and how fast?", "What did you sacrifice to make it work?", "Would you do it again?"],
      whatGoodLooksLike: "Energy around ambiguity. Ships fast and iterates. Doesn't need permission. Has done it before.",
      redFlags: ["Needs structure and clear process", "Frustrated by change", "Wants to research before acting"],
    };
  }
  if (stage === "enterprise") {
    return {
      competency: "Enterprise scale fit",
      question: "Tell me about a time you delivered a significant outcome in a complex, matrixed organisation. How did you navigate the politics and get things done?",
      followUps: ["Who were your key allies?", "Who pushed back and why?", "What would you do differently?"],
      whatGoodLooksLike: "Politically savvy. Builds coalitions. Patient but persistent. Understands how large organisations make decisions.",
      redFlags: ["Dismissive of process", "Can't operate without authority", "Frustrated by consensus"],
    };
  }
  return {
    competency: "Growth stage fit",
    question: "Tell me about a time you had to balance moving fast with maintaining quality or standards. How did you decide where to draw the line?",
    followUps: ["What broke because you moved too fast?", "What slowed you down unnecessarily?", "What's your rule of thumb now?"],
    whatGoodLooksLike: "Has a nuanced view on speed vs. quality. Has made both types of mistakes. Has a principle they can articulate.",
    redFlags: ["Always quality first (too slow)", "Always speed first (no discipline)", "Has never thought about the tradeoff"],
  };
}

function buildStructureGuide(interviewType: string): string[] {
  const base = [
    "Open with a warm 2-minute intro — who you are, the role, what the conversation will cover",
    "Use STAR probing: Situation → Task → Action → Result",
    "Take notes in real time — don't rely on memory for the debrief",
    "Hold space — let them finish before following up",
    "Don't telegraph the 'right' answer in your follow-up questions",
  ];
  if (interviewType === "technical") base.push("Walk through at least one real problem from your codebase or domain — not toy problems");
  if (interviewType === "case") base.push("Provide the case brief 5 minutes before — don't spring it cold", "Assess how they structure the problem, not just the answer");
  if (interviewType === "panel") base.push("Assign each panellist a competency to own — avoid pile-on questions", "Designate one facilitator to manage time and flow");
  return base;
}

function buildOpeningScript(role: string, interviewType: string): string {
  return `"Thanks for making time today — I'm really looking forward to this conversation. We're interviewing for the ${role} role, and the goal of today's ${interviewType} interview is [X — describe what you'll cover]. It'll be about [duration] long. I'll take some notes as we go, which helps me be more present rather than trying to memorise everything. Please feel free to ask me questions at any point, and we'll save some time at the end for you to ask more. Sound good? Great — let's start."`;
}

function buildClosingScript(stage: string): string {
  const urgency = stage === "early_startup" ? "We move fast and we'll have a decision within a few days." : "We'll be in touch within the week with next steps.";
  return `"That's everything I had — thank you, this was a great conversation. Do you have any questions for me about the role, the team, or the company?" [Answer questions honestly] "Is there anything about your background we didn't cover that you think is important for us to know?" [Listen] "Great. ${urgency} Is there anything you need from us to make a decision if we get to that stage?" [Note anything they mention — it's valuable intel]"`;
}

function buildDebriefGuide(): string[] {
  return [
    "Debrief within 24 hours — memory degrades fast",
    "Each interviewer submits their scorecard BEFORE the debrief call — avoid anchoring bias",
    "Start the debrief with a written score, not a verbal opinion",
    "Discuss competency by competency — not overall 'vibes'",
    "Identify any competencies that weren't assessed — do you need another conversation?",
    "If you're on the fence, a second opinion is cheaper than a bad hire",
    "Make a hire/no-hire decision in the debrief — don't leave it open-ended",
  ];
}

function getLegalReminders(): string[] {
  return [
    "Do NOT ask about: age, marital status, children, religion, national origin, disability, pregnancy, sexual orientation",
    "Do NOT ask about salary history (illegal in many jurisdictions)",
    "Do NOT ask where they're originally from — ask if they're authorised to work in [country]",
    "Avoid questions about gaps in employment that assume family or health reasons",
    "Keep all interview notes — they may be needed if a hiring decision is challenged",
    "Assess every candidate against the same scorecard — consistency protects you legally",
  ];
}

function getDuration(interviewType: string): string {
  const durations: Record<string, string> = {
    screening: "30 minutes",
    technical: "60–90 minutes",
    behavioural: "45–60 minutes",
    case: "60–90 minutes",
    panel: "60 minutes",
    final: "45–60 minutes",
  };
  return durations[interviewType] ?? "60 minutes";
}
