import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import fs from "fs";

export class FixtureReplayLLMService extends MockLLMService {
  name = "FixureReplayLLM";

  constructor(fixtureName: string) {
    const fileUrl = new URL(
      `recordings/${fixtureName}.chunks.txt`,
      import.meta.url,
    );
    const fixture = fs.readFileSync(fileUrl, "utf8");

    const chunks = fixture
      .split("\n")
      .map((c) => c.replaceAll("__NEWLINE__", "\n"));

    super(chunks);
  }
}
