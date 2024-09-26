import { writeBatchFile } from "../openai-batches/writeBatchFile";
import { getBatchFileLine } from "./getBatchFileLine";

export async function generateBatchFile({
  batchId,
  lessons,
}: {
  batchId: string;
  lessons: Lesson[];
}) {
  writeBatchFile({
    batchId,
    data: lessons,
    getBatchFileLine,
  });
}
