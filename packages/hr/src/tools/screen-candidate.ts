import { z } from "zod";
import { success, failure } from "@autostackup/core";

const ScreenCandidateInputSchema = z.object({
  candidateName: z.string().describe("Full name of the candidate"),
  role: z.string().describe("Job title being hired for"),
  yearsExperience: z.number().describe("Years of relevant experience"),
  skills: z.array(z.string()).describe("Skills the candidate has"),
  requiredSkills: z.array(z.string()).describe("Skills required for the role"),
  niceToHaveSkills: z.array(z.string()).optional().describe("Skills that are a bonus"),
  background: z.string().describe("Brief background — education, companies, notable achievements"),
  redFlags: z.array(z.string()).optional().describe("Any concerns noted (gaps, short tenures, etc.)"),
  salaryExpectation: z.number().optional().describe("Candidate's salary expectation in USD"),
  budgetCeiling: z.number().optional().describe("Maximum budget for the role in USD"),
  mustHaves: z.array(z.string()).optional().describe("Non-negotiable requirements — instant disqualify if missing"),
});

type ScreenCandidateInput = z.infer<typeof ScreenCandidateInputSchema>;

interface CompetencyScore {
  area: string;
  score: number;
  weight: number;
  notes: string;
}

interface ScreeningResult {
  candidateName: string;
  role: string;
  overallScore: number;
  tier: "A" | "B" | "C" | "D";
  tierLabel: string;
  recommendation: string;
  disqualified: boolean;
  disqualifyReason?: string;
  skillCoverage: number;
  skillsMatched: string[];
  skillsGaps: string[];
  bonusSkillsMatched: string[];
  competencyScores: CompetencyScore[];
  salaryFit: "within_budget" | "over_budget" | "unknown";
  strengths: string[];
  concerns: string[];
  suggestedInterviewFocus: string[];
  nextStep: string;
}

export const screenCandidateSchema = ScreenCandidateInputSchema;

export function screenCandidate(input: ScreenCandidateInput): ReturnType<typeof success> | ReturnType<typeof failure> {
  try {
    // Hard disqualify on must-haves
    if (input.mustHaves && input.mustHaves.length > 0) {
      const lowerBackground = input.background.toLowerCase();
      const lowerSkills = input.skills.map(s => s.toLowerCase());
      for (const mustHave of input.mustHaves) {
        const lowerMustHave = mustHave.toLowerCase();
        const hasIt =
          lowerSkills.some(s => s.includes(lowerMustHave)) ||
          lowerBackground.includes(lowerMustHave);
        if (!hasIt) {
          const result: ScreeningResult = {
            candidateName: input.candidateName,
            role: input.role,
            overallScore: 0,
            tier: "D",
            tierLabel: "Disqualified",
            recommendation: "Do not proceed",
            disqualified: true,
            disqualifyReason: `Missing non-negotiable requirement: "${mustHave}"`,
            skillCoverage: 0,
            skillsMatched: [],
            skillsGaps: input.requiredSkills,
            bonusSkillsMatched: [],
            competencyScores: [],
            salaryFit: "unknown",
            strengths: [],
            concerns: [`Does not meet must-have: ${mustHave}`],
            suggestedInterviewFocus: [],
            nextStep: "Send polite rejection email. Keep profile on file if requirements change.",
          };
          return success(result);
        }
      }
    }

    // Skill matching
    const lowerCandidateSkills = input.skills.map(s => s.toLowerCase());
    const skillsMatched = input.requiredSkills.filter(req =>
      lowerCandidateSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs))
    );
    const skillsGaps = input.requiredSkills.filter(req =>
      !lowerCandidateSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs))
    );
    const bonusSkillsMatched = (input.niceToHaveSkills ?? []).filter(bonus =>
      lowerCandidateSkills.some(cs => cs.includes(bonus.toLowerCase()) || bonus.toLowerCase().includes(cs))
    );

    const skillCoverage = input.requiredSkills.length > 0
      ? Math.round((skillsMatched.length / input.requiredSkills.length) * 100)
      : 100;

    // Competency scoring (weighted)
    const competencies: CompetencyScore[] = [
      {
        area: "Skills Match",
        score: skillCoverage,
        weight: 35,
        notes: `${skillsMatched.length}/${input.requiredSkills.length} required skills matched`,
      },
      {
        area: "Experience Level",
        score: scoreExperience(input.yearsExperience, input.role),
        weight: 30,
        notes: `${input.yearsExperience} years of experience`,
      },
      {
        area: "Background Quality",
        score: scoreBackground(input.background),
        weight: 25,
        notes: "Based on companies, education, and career trajectory",
      },
      {
        area: "Red Flag Risk",
        score: scoreRedFlags(input.redFlags ?? []),
        weight: 10,
        notes: (input.redFlags ?? []).length === 0 ? "No red flags identified" : `${input.redFlags?.length} concern(s) noted`,
      },
    ];

    const overallScore = Math.round(
      competencies.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0)
    );

    // Bonus for nice-to-have skills
    const bonusPoints = Math.min(bonusSkillsMatched.length * 3, 10);
    const finalScore = Math.min(overallScore + bonusPoints, 100);

    const tier = finalScore >= 80 ? "A" : finalScore >= 65 ? "B" : finalScore >= 45 ? "C" : "D";
    const tierLabels = {
      A: "Strong — move to interview immediately",
      B: "Promising — worth a screening call",
      C: "Borderline — only if pipeline is thin",
      D: "Not recommended",
    };

    // Salary fit
    let salaryFit: ScreeningResult["salaryFit"] = "unknown";
    if (input.salaryExpectation !== undefined && input.budgetCeiling !== undefined) {
      salaryFit = input.salaryExpectation <= input.budgetCeiling ? "within_budget" : "over_budget";
    }

    const strengths = buildStrengths(input, skillsMatched, bonusSkillsMatched, finalScore);
    const concerns = buildConcerns(input, skillsGaps, salaryFit);
    const suggestedInterviewFocus = buildInterviewFocus(skillsGaps, input.redFlags ?? [], input.role);
    const nextStep = buildNextStep(tier, salaryFit);

    const result: ScreeningResult = {
      candidateName: input.candidateName,
      role: input.role,
      overallScore: finalScore,
      tier,
      tierLabel: tierLabels[tier],
      recommendation: tier === "A" || tier === "B" ? "Proceed" : tier === "C" ? "Hold" : "Reject",
      disqualified: false,
      skillCoverage,
      skillsMatched,
      skillsGaps,
      bonusSkillsMatched,
      competencyScores: competencies,
      salaryFit,
      strengths,
      concerns,
      suggestedInterviewFocus,
      nextStep,
    };

    return success(result);
  } catch (err) {
    return failure(`Screening failed: ${err instanceof Error ? err.message : String(err)}`, "UNKNOWN");
  }
}

function scoreExperience(years: number, role: string): number {
  const lowerRole = role.toLowerCase();
  const isSenior = lowerRole.includes("senior") || lowerRole.includes("lead") || lowerRole.includes("principal") || lowerRole.includes("director");
  const isJunior = lowerRole.includes("junior") || lowerRole.includes("associate") || lowerRole.includes("entry");

  if (isSenior) {
    if (years >= 7) return 100;
    if (years >= 5) return 80;
    if (years >= 3) return 55;
    return 30;
  }
  if (isJunior) {
    if (years <= 2) return 100;
    if (years <= 4) return 85;
    return 70;
  }
  // Mid-level default
  if (years >= 3 && years <= 7) return 100;
  if (years >= 2) return 85;
  if (years >= 1) return 65;
  return 40;
}

function scoreBackground(background: string): number {
  const lower = background.toLowerCase();
  let score = 60; // baseline

  const premiumSignals = ["faang", "google", "meta", "amazon", "apple", "microsoft", "stripe", "airbnb", "uber", "netflix", "ipo", "series c", "series d", "unicorn", "harvard", "mit", "stanford", "oxford", "cambridge", "phd", "published", "patent", "open source"];
  const goodSignals = ["startup", "scale", "growth", "promoted", "led", "built", "launched", "increased", "reduced", "founded", "mba", "degree"];

  for (const signal of premiumSignals) {
    if (lower.includes(signal)) { score += 8; }
  }
  for (const signal of goodSignals) {
    if (lower.includes(signal)) { score += 4; }
  }

  return Math.min(score, 100);
}

function scoreRedFlags(redFlags: string[]): number {
  if (redFlags.length === 0) return 100;
  if (redFlags.length === 1) return 75;
  if (redFlags.length === 2) return 50;
  return 25;
}

function buildStrengths(input: ScreenCandidateInput, matched: string[], bonusMatched: string[], score: number): string[] {
  const strengths: string[] = [];
  if (matched.length === input.requiredSkills.length) strengths.push("Full required skill coverage — no gaps");
  if (matched.length > 0) strengths.push(`Covers ${matched.length} of ${input.requiredSkills.length} required skills: ${matched.slice(0, 3).join(", ")}${matched.length > 3 ? "..." : ""}`);
  if (bonusMatched.length > 0) strengths.push(`Bonus skills: ${bonusMatched.join(", ")}`);
  if (input.yearsExperience >= 5) strengths.push(`${input.yearsExperience} years of experience — strong seniority signal`);
  if (score >= 80) strengths.push("High overall candidate score — prioritise in pipeline");
  return strengths;
}

function buildConcerns(input: ScreenCandidateInput, gaps: string[], salaryFit: ScreeningResult["salaryFit"]): string[] {
  const concerns: string[] = [];
  if (gaps.length > 0) concerns.push(`Missing required skills: ${gaps.join(", ")}`);
  if (salaryFit === "over_budget") concerns.push(`Salary expectation ($${input.salaryExpectation?.toLocaleString()}) exceeds budget ($${input.budgetCeiling?.toLocaleString()}) — discuss early`);
  if ((input.redFlags ?? []).length > 0) concerns.push(...(input.redFlags ?? []).map(r => `Red flag: ${r}`));
  return concerns;
}

function buildInterviewFocus(gaps: string[], redFlags: string[], role: string): string[] {
  const focus: string[] = [];
  if (gaps.length > 0) focus.push(`Probe depth on missing skills: ${gaps.slice(0, 2).join(", ")}`);
  if (redFlags.length > 0) focus.push("Address red flags directly — ask for context and timeline");
  focus.push(`Assess culture fit and motivation for this specific ${role} opportunity`);
  focus.push("Ask for a concrete example of their highest-impact project");
  return focus;
}

function buildNextStep(tier: string, salaryFit: ScreeningResult["salaryFit"]): string {
  if (tier === "A") {
    return salaryFit === "over_budget"
      ? "Priority candidate — schedule screening call immediately and address salary expectation early. Don't lose them over assumptions."
      : "Move to technical/competency interview within 48 hours. Top candidates disappear fast.";
  }
  if (tier === "B") return "Schedule a 30-minute recruiter screening call to validate skills and motivation before investing further.";
  if (tier === "C") return "Hold in pipeline. Revisit only if stronger candidates don't emerge within 2 weeks.";
  return "Send polite rejection. Document profile for future roles.";
}
