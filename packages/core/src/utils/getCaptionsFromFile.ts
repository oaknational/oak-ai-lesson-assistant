import { Storage } from "@google-cloud/storage";
import { aiLogger } from "@oakai/logger";
import type { Cue } from "webvtt-parser";
import { WebVTTParser } from "webvtt-parser";
import { z } from "zod";

const log = aiLogger("transcripts");

const key = process.env.GOOGLE_STORAGE_BUCKET_KEY;

class GoogleStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleStorageError";
  }
}

export type CredentialBody = {
  client_email: string;
  private_key: string;
};

export type StorageClientArgs = {
  storageAccountJson: string;
  captionBucket: string;
};

const credentialSchema = z.object({
  client_email: z.string(),
  private_key: z.string(),
});

const formatCredentials = (credentials: string): CredentialBody => {
  try {
    const parsed = JSON.parse(
      Buffer.from(credentials, "base64").toString("utf8"),
    );
    return credentialSchema.parse(parsed);
  } catch (error) {
    const err = error as Error;
    throw new GoogleStorageError(
      "Error formatting credentials: " + err.message,
    );
  }
};

const getClient = (credentialsJson: string) => {
  try {
    const credentials = formatCredentials(credentialsJson);
    return new Storage({
      credentials,
    });
  } catch (error) {
    const err = error as Error;
    throw new GoogleStorageError(
      "Error getting google storage client: " + err.message,
    );
  }
};

const getBucket = (client: Storage, bucketName: string) => {
  try {
    return client.bucket(bucketName);
  } catch (error) {
    const err = error as Error;
    throw new GoogleStorageError(
      "Error getting google storage bucket: " + err.message,
    );
  }
};

export const getCaptionsFromFile = async (fileName: string) => {
  // TODO: get bucket name from config?
  const bucketName = "oak-captions-2023-production";
  const file = await getFileFromBucket(bucketName, fileName);
  if (file) {
    const parser = new WebVTTParser();
    const tree = parser.parse(file, "metadata");

    if (tree.errors.length) {
      log.error(
        `Error parsing captions file: ${fileName}, errors: ${JSON.stringify(
          tree.errors,
        )}`,
      );
      return;
    }

    const transcriptFromCues = getTextFromCues(tree.cues);
    const caption = tree.cues.map((cue) => {
      return {
        text: cue.text.replace("<v ->", "").replace("</v>", ""),
        start: cue.startTime * 1000,
        end: cue.endTime * 1000,
      };
    });
    const transcript = formatSentences(
      removeWebVttCharacters(transcriptFromCues),
    );

    return { transcript, caption };
  }
};

export const formatSentences = (sentences: Array<string>): Array<string> => {
  // The sentences retrieved may be split in the middle and put onto multiple lines, this roughly puts them back together
  // with a crude hack to ignore full stops following Mr or Mrs
  // also ignoring full stops before quotation, whuich has the undesired effect of grouping near quotes
  const joined = sentences.join(" ");
  const splitOnFullStop = joined.split(/(?<!Mr|Mrs|Ms)\.(?!")/gi);
  return splitOnFullStop
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => `${sentence.trim()}.`);
};

export const removeWebVttCharacters = (
  sentences: Array<string>,
): Array<string> => {
  // The opening sentence of the vtt file is wrapped in <v ->> </v>
  // I'm not sure why but we want to remove it
  const sentence1 = sentences[0]!.replace("<v ->", "").replace("</v>", "");
  return [sentence1, ...sentences.slice(1)];
};

export const getTextFromCues = (cueList: Cue[]): Array<string> => {
  return Object.values(cueList).map((cue) => cue.text);
};

export async function getFileFromBucket(bucketName: string, fileName: string) {
  const bucket = getBucket(getClient(key as string), bucketName);

  try {
    const contents = await bucket.file(fileName).download();
    return contents.toString();
  } catch (err) {
    log.error(
      `Error fetching file: ${fileName} from bucket: ${bucketName}. Error: ${
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : JSON.stringify(err)
      }`,
    );
    return;
  }
}
