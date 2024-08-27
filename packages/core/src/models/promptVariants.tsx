import { PrismaClientWithAccelerate } from "@oakai/db";
import dedent from "ts-dedent";
import { Md5 } from "ts-md5";

import errorHandling from "../prompts/shared/error-handling";
import promptInjection from "../prompts/shared/prompt-injection";
import { OakPromptDefinition, OakPromptVariant } from "../prompts/types";

export class PromptVariants {
  definition: OakPromptDefinition;
  variant: OakPromptVariant;
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    promptDefinition: OakPromptDefinition,
    variantSlug: string,
  ) {
    this.definition = promptDefinition;
    const foundVariant =
      promptDefinition.variants.find((v) => (v.slug = variantSlug)) ??
      promptDefinition.variants.find((v) => v.slug === "main");
    if (!foundVariant) {
      throw new Error("No variant found");
    }
    this.variant = foundVariant;
  }

  async setCurrent() {
    const template = this.format();
    const hash = Md5.hashStr(template);
    const existing = await this.prisma.prompt.findFirst({
      where: {
        hash,
      },
    });
    if (existing) {
      return;
    }
    const {
      name,
      slug,
      appId: appSlug,
      inputSchema,
      outputSchema,
    } = this.definition;

    const app = await this.prisma.app.findFirstOrThrow({
      where: { slug: appSlug },
    });
    const maxVersionRows = (await this.prisma
      .$queryRaw`select max(version) as max_version from prompts where slug = ${slug}`) as {
      max_version: number;
    }[];
    const maxVersion = maxVersionRows?.[0]?.max_version ?? 0;
    const version = maxVersion + 1;
    const variant = "main"; // TODO enable support for more than one variant
    const created = await this.prisma.prompt.create({
      data: {
        hash,
        appId: app.id,
        name,
        slug,
        template,
        inputSchema: JSON.stringify(inputSchema),
        outputSchema: JSON.stringify(outputSchema),
        current: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variant,
        identifier: `${slug}-${variant}-${version}`,
        version,
        gitSha: process.env.CACHED_COMMIT_REF ?? null, // Netlify-specific environment variable for the latest git commit
      },
    });
    // Mark previous prompts as historic
    await this.prisma.prompt.updateMany({
      data: {
        current: false,
        updatedAt: new Date().toISOString(),
      },
      where: {
        slug: {
          equals: slug,
        },
        id: {
          not: {
            equals: created.id,
          },
        },
      },
    });
  }

  format() {
    const { parts } = this.variant;
    const { body, context, output, task } = parts;
    return dedent`CONTEXT 
    ${context}

    PROMPT INJECTION
    ${promptInjection}

    TASK
    ${task}

    INSTRUCTIONS
    ${body}

    OUTPUT
    ${output}

    ERROR HANDLING
    ${errorHandling}`;
  }
}
