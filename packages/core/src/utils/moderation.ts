import LanguageDetect from "languagedetect";
import {
  RegExpMatcher,
  TextCensor,
  englishDataset, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  englishRecommendedTransformers, // @ts-ignore: Could not find declaration file
} from "obscenity";
import OpenAI from "openai";

export const moderationConfig: Record<string, number | boolean | string> = {
  MODERATE_PROFANITY: false,
  MODERATION_ENABLED: true,
};

const thresholdConfig: Record<string, number> = {
  MODERATION_THRESHOLD_HARASSMENT_THREATENING: 0.1,
  MODERATION_THRESHOLD_HARASSMENT: 0.1,
  MODERATION_THRESHOLD_HATE_THREATENING: 0.1,
  MODERATION_THRESHOLD_HATE: 0.1,
  MODERATION_THRESHOLD_SELF_HARM_INSTRUCTIONS: 0.1,
  MODERATION_THRESHOLD_SELF_HARM_INTENT: 0.1,
  MODERATION_THRESHOLD_SELF_HARM: 0.1,
  MODERATION_THRESHOLD_SEXUAL_MINORS: 0.1,
  MODERATION_THRESHOLD_SEXUAL: 0.1,
  MODERATION_THRESHOLD_VIOLENCE_GRAPHIC: 0.1,
  MODERATION_THRESHOLD_VIOLENCE: 0.1,
};

// MODERATE_ENGLISH_LANGUAGE doesn't appear in doppler
const MODERATE_LANGUAGE = Boolean(process.env.MODERATE_ENGLISH_LANGUAGE);
const ENGLISH_THRESHOLD =
  parseFloat(process.env.MODERATION_THRESHOLD_ENGLISH_LANGUAGE || "") || 0.4;

if (MODERATE_LANGUAGE && Number.isNaN(ENGLISH_THRESHOLD)) {
  throw new Error(
    `Missing or invalid env var MODERATION_THRESHOLD_ENGLISH_LANGUAGE`,
  );
}

/**
 * Setup
 */

const categoriesToEnv: Record<string, string> = {
  sexual: "MODERATION_THRESHOLD_SEXUAL",
  hate: "MODERATION_THRESHOLD_HATE",
  harassment: "MODERATION_THRESHOLD_HARASSMENT",
  "self-harm": "MODERATION_THRESHOLD_SELF_HARM",
  "sexual/minors": "MODERATION_THRESHOLD_SEXUAL_MINORS",
  "hate/threatening": "MODERATION_THRESHOLD_HATE_THREATENING",
  "violence/graphic": "MODERATION_THRESHOLD_VIOLENCE_GRAPHIC",
  "self-harm/intent": "MODERATION_THRESHOLD_SELF_HARM_INTENT",
  "self-harm/instructions": "MODERATION_THRESHOLD_SELF_HARM_INSTRUCTIONS",
  "harassment/threatening": "MODERATION_THRESHOLD_HARASSMENT_THREATENING",
  violence: "MODERATION_THRESHOLD_VIOLENCE",
};

const moderationThresholds: Record<string, number> = {};

for (const key of Object.keys(categoriesToEnv)) {
  const envVar = categoriesToEnv[key];
  if (!envVar) {
    throw new Error(`Missing env var mapping ${key}`);
  }
  const threshold = thresholdConfig[envVar];
  if (!threshold) {
    throw new Error(`Missing env var ${envVar}`);
  }
  moderationThresholds[key] = threshold;
}

/**
 * English language checks
 */

type InputEnglishScores = Array<[string, number]>;

/**
 * Check if the given string contains any phrases below
 * our ENGLISH_THRESHOLD setting
 *
 * @TODO: Currently this operates on the userInput
 * array, if we want better matching we may want to
 * try and serialize/deserialize the promptInputs
 */

export function checkEnglishLanguageScores(
  userInput: string[],
): [boolean, InputEnglishScores] {
  const languageDetector = new LanguageDetect();
  const englishScores = userInput.map((input): [string, number] => {
    const scores = languageDetector.detect(input);
    const english = scores.find((i) => i?.[0] === "english");
    const score = english ? english[1] : 0;
    return [input, score];
  });

  const isEnglish = englishScores.every(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_word, score]) => score >= ENGLISH_THRESHOLD,
  );

  return [isEnglish, englishScores];
}

/**
 * Profanity checking
 */
const censor = new TextCensor();
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
  whitelistedTerms: ["Oral tradition", "Language analysis", "analysis"],
});

type ProfanityResult = [true, string] | [false, null];

/**
 * Check if the given string contains profanity, if so
 * return a censored version for storage
 *
 * @TODO: Currently this operates on the userInput
 * array, if we want better matching we may want to
 * try and serialize/deserialize the promptInputs
 *
 * @example
 *  detectProfanity(["word that rhymes with", "ducks"])
 *     // -> [true, "word what rhymes with %@$%s"]
 */
export function detectProfanity(userInput: string[]): ProfanityResult {
  const inputText = userInput.join(" | ");

  if (matcher.hasMatch(inputText)) {
    const allMatches = matcher.getAllMatches(inputText);
    const censoredResult = censor.applyTo(inputText, allMatches);
    return [true, censoredResult];
  }
  return [false, null];
}

/**
 * OpenAI moderation
 *
 * Submit an input to OpenAI, which will tell us if
 * the text is flagged by their ToS, and scores
 * for individual categories (hate, violence etc)
 *
 * Returns if it was flagged, if any inputs are
 * over our threshold, and the raw OpenAI results
 * for later analysis
 *
 * @TODO: It might be useful to return which specific values
 * were over the threshold and the current values at the time
 * of moderation
 */
export async function doOpenAIModeration(
  moderations: OpenAI.Moderations,
  userInput: string[],
) {
  const moderation = await moderations.create({
    input: userInput.join(". "),
  }); // TODO If any other inputs allow for user input, include here
  const moderationResults = moderation.results;

  const isFlagged = moderationResults
    .map((result) => result.flagged)
    .includes(true);

  const isOverModerationThreshold =
    moderationResults
      .flatMap((result) => {
        return Object.keys(result.categories).map((category: string) => {
          const cats = result.category_scores;
          const threshold = moderationThresholds[category];
          if (!threshold) {
            throw new Error("Missing threshold for category");
          }

          const score = category in cats && cats[category as keyof typeof cats];
          const isOverThreshold = score && score > threshold;

          return isOverThreshold;
        });
      })
      .filter(Boolean).length > 0;

  return {
    moderationResults,
    isFlagged,
    isOverModerationThreshold,
  };
}
