-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT,
    "prompt_id" TEXT,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppToStatistics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PromptToStatistics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "statistics_name_app_id_prompt_id_key" ON "statistics"("name", "app_id", "prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AppToStatistics_AB_unique" ON "_AppToStatistics"("A", "B");

-- CreateIndex
CREATE INDEX "_AppToStatistics_B_index" ON "_AppToStatistics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PromptToStatistics_AB_unique" ON "_PromptToStatistics"("A", "B");

-- CreateIndex
CREATE INDEX "_PromptToStatistics_B_index" ON "_PromptToStatistics"("B");

-- AddForeignKey
ALTER TABLE "_AppToStatistics" ADD CONSTRAINT "_AppToStatistics_A_fkey" FOREIGN KEY ("A") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppToStatistics" ADD CONSTRAINT "_AppToStatistics_B_fkey" FOREIGN KEY ("B") REFERENCES "statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToStatistics" ADD CONSTRAINT "_PromptToStatistics_A_fkey" FOREIGN KEY ("A") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToStatistics" ADD CONSTRAINT "_PromptToStatistics_B_fkey" FOREIGN KEY ("B") REFERENCES "statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
