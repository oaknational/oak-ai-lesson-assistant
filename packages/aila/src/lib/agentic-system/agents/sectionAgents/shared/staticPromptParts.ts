import { identityAndVoice } from "./identityAndVoice";
import { type VoiceId, getVoiceDefinitions, getVoicePrompt } from "./voices";

/**
 * The static (non-dynamic) portion of an agent's prompt: shared identity,
 * instructions, and voice guidance. This is the single source of truth for
 * both the runtime prompt (spread into an agent's `input`) and the versioned
 * prompt template stored against each generation, so the two can never drift.
 */
export type StaticPromptTemplate = {
  /** Section agents share the common identity/voice preamble; others don't. */
  includeIdentity: boolean;
  instructions: string;
  /** Additional voices whose definitions are included, beyond the default. */
  voices?: VoiceId[];
  /** The voice the agent speaks in; its "how to speak" prompt is included. */
  defaultVoice?: VoiceId;
};

type DeveloperPart = { role: "developer"; content: string };

function developerPart(content: string): DeveloperPart {
  return { role: "developer", content };
}

export function staticPromptParts(
  template: StaticPromptTemplate,
): DeveloperPart[] {
  const { includeIdentity, instructions, defaultVoice } = template;
  const voices =
    defaultVoice && !(template.voices ?? []).includes(defaultVoice)
      ? [defaultVoice, ...(template.voices ?? [])]
      : (template.voices ?? []);

  return [
    ...(includeIdentity ? [developerPart(identityAndVoice)] : []),
    developerPart(instructions),
    ...(voices.length > 0 ? [developerPart(getVoiceDefinitions(voices))] : []),
    ...(defaultVoice ? [developerPart(getVoicePrompt(defaultVoice))] : []),
  ];
}

/** The static prompt rendered as a single string, for prompt versioning. */
export function renderStaticPromptTemplate(
  template: StaticPromptTemplate,
): string {
  return staticPromptParts(template)
    .map((part) => part.content)
    .join("\n\n");
}
