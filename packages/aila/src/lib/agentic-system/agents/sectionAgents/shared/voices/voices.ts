/**
 * Voice definitions for Aila agents
 * These voices define the tone, audience, and purpose for different types of content
 */

export interface Voice {
  id: VoiceId;
  speaker: string;
  audience: string;
  description: string;
  example?: string;
}

export const voices = {
  AILA_TO_TEACHER: {
    id: "AILA_TO_TEACHER",
    speaker: "Aila",
    audience: "User",
    description:
      "Supportive expert guiding the teacher. Polite and clear. You can ask for clarification from the teacher if required.",
  },
  PUPIL: {
    id: "PUPIL",
    speaker: "A pupil",
    audience: "other pupils/teacher",
    description:
      'Use this voice for the learning outcome (e.g. "I can...") and for any model answers or example pupil work. Match the tone to pupil age.',
  },
  TEACHER_TO_PUPIL_WRITTEN: {
    id: "TEACHER_TO_PUPIL_WRITTEN",
    speaker: "Teacher",
    audience: "Pupils (written)",
    description:
      "Use this voice to write the text that will appear on slides or lesson resources. Formal, concise, and instructional. No chatty tone.",
  },
  TEACHER_TO_PUPIL_SPOKEN: {
    id: "TEACHER_TO_PUPIL_SPOKEN",
    speaker: "Teacher",
    audience: "Pupils (spoken)",
    description:
      "Use this voice for lesson narratives. Professional but slightly friendlier. May include analogies or examples.",
  },
  EXPERT_TEACHER: {
    id: "EXPERT_TEACHER",
    speaker: "Expert teacher",
    audience: "User",
    description:
      "Use this voice to explain (from your experience) key knowledge, common mistakes and misconceptions that pupils at this age might have or need, pedagogical insights and advice.",
  },
  AGENT_TO_AGENT: {
    id: "AGENT_TO_AGENT",
    speaker: "Aila",
    audience: "Other agents",
    description:
      "Use this voice when communicating with other agents. It should be clear, concise, and focused on the task at hand.",
  },
  AGENT_TO_DEVELOPER: {
    id: "AGENT_TO_DEVELOPER",
    speaker: "Aila",
    audience: "Developers",
    description:
      "Use this voice when communicating with developers. It should be clear, concise, and focused on the task at hand.",
  },
} as const;

export type VoiceId = keyof typeof voices;

/**
 * Get voice instructions for a specific voice
 */
export function getVoiceInstructions(voiceId: VoiceId): string {
  const voice = voices[voiceId];
  return `### ${voice.id}
Speaker: ${voice.speaker}
Audience: ${voice.audience}
${voice.description}`;
}

/**
 * Generate voice instruction for a specific voice to include in prompts
 */
export function getVoicePrompt(voiceId: VoiceId): string {
  return `## Voice guidance

Unless otherwise specified, use ${voiceId}.`;
}

/**
 * Generate voice definitions section for multiple voices
 * This provides the agent with detailed information about each voice it needs to use
 */
export function getVoiceDefinitions(voiceIds: VoiceId[]): string {
  if (voiceIds.length === 0) return "";

  const definitions = voiceIds
    .map((voiceId) => getVoiceInstructions(voiceId))
    .join("\n\n");

  return `## Voice Definitions

The following voice definitions are available for this task:

${definitions}`;
}
