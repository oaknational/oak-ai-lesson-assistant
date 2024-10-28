import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import dedent from "ts-dedent";
import { Md5 } from "ts-md5";

import errorHandling from "../prompts/shared/error-handling";
import promptInjection from "../prompts/shared/prompt-injection";
import type { OakPromptDefinition, OakPromptVariant } from "../prompts/types";

const log = aiLogger("prompts");

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

  async setCurrent(variant: string, storeAsJson = false) {
    const template = this.format({ storeAsJson });
    const { slug } = this.definition;
    const hash = promptHash({ slug, variant, template });
    const existing = await this.prisma.prompt.findFirst({
      where: {
        AND: [{ hash }, { slug }, { variant }, { current: true }],
      },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });
    if (existing) {
      return existing;
    }
    log.info(
      `Storing new prompt version for ${slug} / ${variant} with hash ${hash}`,
    );

    const { name, appId: appSlug, inputSchema, outputSchema } = this.definition;

    const app = await this.prisma.app.findFirstOrThrow({
      where: { slug: appSlug },
    });
    const maxVersionRows = (await this.prisma
      .$queryRaw`select max(version) as max_version from prompts where slug = ${slug}`);
    const maxVersion = maxVersionRows?.[0]?.max_version ?? 0;
    const version = maxVersion + 1;
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
        identifier: promptIdentifier({ slug, variant, version }),
        version,
        gitSha:
          process.env.VERCEL_GIT_COMMIT_SHA ??
          process.env.CACHED_COMMIT_REF ??
          null, // Vercel- and Netlify-specific environment variable for the latest git commit
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
        variant: {
          equals: variant,
        },
        id: {
          not: {
            equals: created.id,
          },
        },
      },
    });
    return created;
  }

  format({ storeAsJson = false }: { storeAsJson?: boolean }) {
    const { parts } = this.variant;
    const { body, context, output, task } = parts;

    if (storeAsJson) {
      return body;
    }

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

export function promptHash({
  slug,
  variant,
  template,
}: {
  slug: string;
  variant: string;
  template: string;
}) {
  return `${slug}-${variant}-${Md5.hashStr(template)}-${process.env.VERCEL_GIT_COMMIT_SHA ?? "dev"}`;
}

export function promptIdentifier({
  slug,
  variant,
  version,
}: {
  slug: string;
  variant: string;
  version: number;
}): string {
  return `${slug}-${variant}-${version}`;
}
