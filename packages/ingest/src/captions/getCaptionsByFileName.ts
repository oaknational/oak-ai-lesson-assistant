import { Storage } from "@google-cloud/storage";
import { aiLogger } from "@oakai/logger";
import type { Cue} from "webvtt-parser";
import { WebVTTParser } from "webvtt-parser";

const log = aiLogger("ingest");

export const getCaptionsByFileName = async (
  fileName: string,
): Promise<{
  transcript: string[];
  caption: { text: string; start: number; end: number }[];
}> => {
  const bucketName = "oak-captions-2023-production";
  const file = await getFileFromBucket(bucketName, fileName);
  if (!file) {
    throw new Error(`Captions file not found: ${fileName}`);
  }
  const parser = new WebVTTParser();
  const tree = parser.parse(file, "metadata");

  if (tree.errors.length) {
    log.error(
      `Error parsing captions file: ${fileName}, errors: ${JSON.stringify(
        tree.errors,
      )}`,
    );
    throw new Error(`Error parsing captions file: ${fileName}`);
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
};

const formatSentences = (sentences: Array<string>): Array<string> => {
  // The sentences retrieved may be split in the middle and put onto multiple lines, this roughly puts them back together
  // with a crude hack to ignore full stops following Mr or Mrs
  // also ignoring full stops before quotation, whuich has the undesired effect of grouping near quotes
  const joined = sentences.join(" ");
  const splitOnFullStop = joined.split(/(?<!Mr|Mrs|Ms)\.(?!")/gi);
  return splitOnFullStop
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => `${sentence.trim()}.`);
};

const removeWebVttCharacters = (sentences: Array<string>): Array<string> => {
  // The opening sentence of the vtt file is wrapped in <v ->> </v>
  // I'm not sure why but we want to remove it
  const sentence1 = sentences[0]!.replace("<v ->", "").replace("</v>", "");
  return [sentence1, ...sentences.slice(1)];
};

const getTextFromCues = (cueList: Cue[]): Array<string> => {
  return Object.values(cueList).map((cue) => cue.text);
};

async function getFileFromBucket(bucketName: string, fileName: string) {
  const client = new Storage();
  const bucket = client.bucket(bucketName);

  try {
    const contents = await bucket.file(fileName).download();
    return contents.toString();
  } catch (err) {
    log.error(
      `Error fetching file: ${fileName} from bucket: ${bucketName}. Error: ${err}`,
    );
    return;
  }
}
