import { Apps } from "@oakai/core";
import { serializeApp } from "@oakai/core/src/models/serializers";
import { prisma } from "@oakai/db";

import Prompts from "../prompts/prompts";

const appsModel = new Apps(prisma);

async function getApps() {
  const apps = await appsModel.getAll();
  const serializedApps = apps.map(serializeApp);
  return serializedApps;
}

export default async function PromptsPage() {
  const apps = await getApps();

  return <Prompts apps={apps} />;
}
