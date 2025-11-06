/*
  Warnings:

  - You are about to drop the column `analysisData` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "analysisData",
DROP COLUMN "language",
ADD COLUMN     "globalSummary" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "manifest" JSONB;

-- CreateTable
CREATE TABLE "FileAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "summary" TEXT,
    "exports" JSONB NOT NULL,
    "imports" JSONB NOT NULL,
    "functions" JSONB NOT NULL,
    "classes" JSONB,
    "complexity" INTEGER,
    "linesOfCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileAnalysis_projectId_idx" ON "FileAnalysis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FileAnalysis_projectId_path_key" ON "FileAnalysis"("projectId", "path");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- AddForeignKey
ALTER TABLE "FileAnalysis" ADD CONSTRAINT "FileAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
