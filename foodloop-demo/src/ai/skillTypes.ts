export type SkillId =
  | "intake"
  | "handling-risk"
  | "forecast"
  | "matching"
  | "communication"
  | "route"
  | "impact";

export type AISkillStatus = "live" | "simulated";

export interface AISkillExample {
  title: string;
  input: string;
  output: string;
}

export interface AISkillDefinition {
  id: SkillId;
  label: string;
  version: string;
  status: AISkillStatus;
  provider: string;
  purpose: string;
  inputSummary: string;
  outputSummary: string;
  guardrailSummary: string;
  humanConfirmationPoint: string;
  appearsIn: string;
  systemPrompt: string;
  userPromptTemplate: string;
  buildUserPrompt: (context: unknown) => string;
  expectedOutputShape: string;
  examples: AISkillExample[];
  guardrails: string[];
  fallbackDescription: string;
}

export interface AISkillMetadata {
  skillId: SkillId;
  skillName: string;
  skillVersion: string;
  guarded: boolean;
}

export interface AISkillResponseMetadata extends AISkillMetadata {
  supportingSkills?: AISkillMetadata[];
}

export interface AISkillTaggedResponse {
  skillId?: SkillId;
  skillName?: string;
  skillVersion?: string;
  guarded?: boolean;
  supportingSkills?: AISkillMetadata[];
}
