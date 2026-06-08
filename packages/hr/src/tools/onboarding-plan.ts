import { z } from "zod";
import { success, failure } from "@autostackup/core";

const OnboardingPlanInputSchema = z.object({
  employeeName: z.string().describe("New hire's full name"),
  role: z.string().describe("Job title"),
  department: z.string().describe("Department or team"),
  manager: z.string().describe("Manager's name"),
  startDate: z.string().describe("Start date (e.g. July 1, 2025)"),
  roleType: z.enum(["individual_contributor", "manager", "executive"]).default("individual_contributor"),
  remote: z.boolean().default(false).describe("Is this a remote role?"),
  keyTools: z.array(z.string()).optional().describe("Key software/tools they'll use (e.g. Salesforce, Notion, Figma)"),
  keyStakeholders: z.array(z.string()).optional().describe("Key people they should meet (names or titles)"),
  topPriorities: z.array(z.string()).optional().describe("Top 3 things they should achieve in their first 90 days"),
  companyValues: z.array(z.string()).optional().describe("Company values to embed in the plan"),
});

type OnboardingPlanInput = z.infer<typeof OnboardingPlanInputSchema>;

interface OnboardingMilestone {
  week: string;
  theme: string;
  goals: string[];
  actions: string[];
  meetings: string[];
  successMetric: string;
}

interface OnboardingPlanResult {
  employeeName: string;
  role: string;
  startDate: string;
  planSummary: string;
  day1Checklist: string[];
  week1: OnboardingMilestone;
  day30: OnboardingMilestone;
  day60: OnboardingMilestone;
  day90: OnboardingMilestone;
  managerChecklist: string[];
  redFlags: string[];
  successDefinition: string;
}

export const onboardingPlanSchema = OnboardingPlanInputSchema;

export function createOnboardingPlan(input: OnboardingPlanInput): ReturnType<typeof success> | ReturnType<typeof failure> {
  try {
    const tools = input.keyTools ?? [];
    const stakeholders = input.keyStakeholders ?? ["Direct manager", "Team members", "Cross-functional leads"];
    const priorities = input.topPriorities ?? ["Understand the product and customers", "Build relationships with key stakeholders", "Deliver first meaningful contribution"];
    const values = input.companyValues ?? [];

    const day1Checklist = buildDay1Checklist(input, tools);
    const week1 = buildWeek1(input, stakeholders, tools);
    const day30 = buildDay30(input, priorities, stakeholders);
    const day60 = buildDay60(input, priorities);
    const day90 = buildDay90(input, priorities);
    const managerChecklist = buildManagerChecklist(input);
    const redFlags = buildRedFlags(input.roleType);

    const planSummary = `30/60/90-day onboarding plan for ${input.employeeName} joining as ${input.role} in ${input.department}. ` +
      `Managed by ${input.manager}. ${input.remote ? "Remote" : "In-office"} role. ` +
      `Focus areas: ${priorities.slice(0, 2).join(", ")}.`;

    const successDefinition = buildSuccessDefinition(input.role, input.roleType, priorities);

    const result: OnboardingPlanResult = {
      employeeName: input.employeeName,
      role: input.role,
      startDate: input.startDate,
      planSummary,
      day1Checklist,
      week1,
      day30,
      day60,
      day90,
      managerChecklist,
      redFlags,
      successDefinition,
    };

    return success(result);
  } catch (err) {
    return failure(`Onboarding plan failed: ${err instanceof Error ? err.message : String(err)}`, "UNKNOWN");
  }
}

function buildDay1Checklist(input: OnboardingPlanInput, tools: string[]): string[] {
  const items = [
    "Send welcome email with first-day logistics before start date",
    "Prepare workstation / send equipment (if remote: confirm delivery)",
    "Create all accounts: email, Slack, HRIS, payroll",
    ...(tools.map(t => `Set up ${t} access`)),
    "Schedule 1:1 with manager — Day 1 afternoon",
    "Introduce to immediate team (in-person or video call)",
    "Share company handbook, org chart, and onboarding doc",
    "Assign onboarding buddy from the team",
    "Walk through 30/60/90 plan together",
    ...(input.remote ? ["Send remote setup stipend if applicable", "Add to all recurring team meetings"] : ["Office tour", "Building access and security badge"]),
  ];
  return items;
}

function buildWeek1(input: OnboardingPlanInput, stakeholders: string[], tools: string[]): OnboardingMilestone {
  return {
    week: "Week 1",
    theme: "Orient & Connect",
    goals: [
      "Understand the team structure, company mission, and immediate priorities",
      "Complete all administrative and system setup",
      "Start building relationships with key people",
    ],
    actions: [
      "Complete HR paperwork and compliance training",
      "Read the last 3 months of company all-hands notes or recordings",
      "Review key product docs, pitch decks, or strategy docs",
      ...(tools.length > 0 ? [`Get hands-on with core tools: ${tools.slice(0, 3).join(", ")}`] : []),
      "Shadow a team member on a real task or meeting",
    ],
    meetings: [
      `Daily 15-min check-in with ${input.manager}`,
      ...stakeholders.slice(0, 3).map(s => `Intro 1:1 with ${s}`),
      "Team stand-up / weekly meeting",
    ],
    successMetric: "Can describe the company's top 3 priorities and who the key people are without looking it up.",
  };
}

function buildDay30(input: OnboardingPlanInput, priorities: string[], stakeholders: string[]): OnboardingMilestone {
  const isManager = input.roleType === "manager" || input.roleType === "executive";
  return {
    week: "Day 30",
    theme: "Understand & Contribute",
    goals: [
      "Deep understanding of the role's core responsibilities",
      "First meaningful contribution or deliverable shipped",
      "Relationships established with all key stakeholders",
    ],
    actions: [
      `Work toward priority: "${priorities[0] ?? "First deliverable"}"`,
      "Complete first independent task with minimal supervision",
      "Identify one process or gap that could be improved (don't fix yet — observe first)",
      ...(isManager ? ["Schedule 1:1s with all direct reports", "Review team performance data and recent work"] : []),
      ...stakeholders.slice(3).map(s => `Connect with ${s}`),
    ],
    meetings: [
      `30-day review with ${input.manager} — discuss progress and any blockers`,
      "Cross-functional stakeholder meetings completed",
      ...(isManager ? ["Team retrospective or planning session attended"] : []),
    ],
    successMetric: "Has shipped at least one real contribution. Manager would describe them as 'ramping up well.'",
  };
}

function buildDay60(input: OnboardingPlanInput, priorities: string[]): OnboardingMilestone {
  const isManager = input.roleType === "manager" || input.roleType === "executive";
  return {
    week: "Day 60",
    theme: "Own & Improve",
    goals: [
      "Operating independently on core responsibilities",
      "Proactively identifying and addressing problems",
      "Building credibility across the organisation",
    ],
    actions: [
      `Drive progress on priority: "${priorities[1] ?? "Second milestone"}"`,
      "Propose and begin implementing one improvement (process, tooling, or workflow)",
      "Actively contribute ideas in team meetings — not just listening",
      ...(isManager ? ["Complete first formal 1:1 cycle with direct reports", "Identify any team gaps or performance concerns"] : []),
      "Seek feedback from 2–3 peers on how to improve",
    ],
    meetings: [
      `60-day review with ${input.manager} — honest two-way feedback session`,
      "Mid-point check with HR or People team",
      ...(isManager ? ["Skip-level 1:1 with ${input.manager}'s manager"] : []),
    ],
    successMetric: "Is trusted to own work end-to-end without daily check-ins. Has made at least one process or quality improvement.",
  };
}

function buildDay90(input: OnboardingPlanInput, priorities: string[]): OnboardingMilestone {
  const isExecutive = input.roleType === "executive";
  return {
    week: "Day 90",
    theme: "Lead & Scale",
    goals: [
      "Fully ramped — operating at the expected level for the role",
      "Delivering measurable results tied to team/company goals",
      "Ready to mentor others or onboard the next new hire",
    ],
    actions: [
      `Complete and review: "${priorities[2] ?? "90-day goal"}"`,
      "Present a 90-day retrospective: what you've learned, what you'd improve, what's next",
      "Define your own Q2/next-quarter goals aligned to team OKRs",
      ...(isExecutive ? ["Present strategic plan or vision for the function to leadership"] : []),
      "Volunteer to onboard or buddy the next new hire",
    ],
    meetings: [
      `90-day formal review with ${input.manager} — assess ramp completion`,
      "Calibration check with HR on performance and compensation review eligibility",
      ...(isExecutive ? ["Board or leadership team introduction if not done"] : []),
    ],
    successMetric: "Manager would say: 'They're fully ramped and running independently. No regrets on the hire.'",
  };
}

function buildManagerChecklist(input: OnboardingPlanInput): string[] {
  return [
    "Send welcome message 3 days before start date",
    "Block calendar for daily 15-min check-ins for the first 2 weeks",
    "Prepare a 'first week reading list' of must-read docs",
    "Assign an onboarding buddy — someone 6+ months in who's a culture carrier",
    "Schedule 30, 60, 90-day review meetings NOW — before they start",
    "Give a meaningful first task by end of Week 1 — don't let them watch for too long",
    "Ask for feedback on the onboarding experience at Day 30",
    `Introduce ${input.employeeName} publicly in company Slack / all-hands`,
    "Check for any tools access gaps by Day 3",
    "Share context on team dynamics, unwritten rules, and 'how we actually work here'",
  ];
}

function buildRedFlags(roleType: string): string[] {
  return [
    "New hire seems disengaged or quiet after Week 2 — address immediately, don't assume they're fine",
    "Still waiting for tool access after Day 3 — escalate to IT",
    "No meaningful work assigned by end of Week 1 — manager action required",
    "New hire mentions confusion about their role or priorities at Day 30 — re-align urgently",
    ...(roleType === "manager" ? ["Direct reports haven't had 1:1s by Day 21 — block time immediately"] : []),
    "No peer relationships formed by Day 30 — assign buddy or facilitate social interactions",
  ];
}

function buildSuccessDefinition(role: string, roleType: string, priorities: string[]): string {
  const base = `At Day 90, ${role} is fully ramped, trusted to work independently, and has delivered: ${priorities.join("; ")}.`;
  if (roleType === "executive") return base + " Has established strategic direction for their function and built cross-functional credibility.";
  if (roleType === "manager") return base + " Has built trust with their direct reports and run at least one full team cycle (sprint, OKR, or review).";
  return base + " Is seen as a contributing team member and is ready to take on increased responsibility.";
}
