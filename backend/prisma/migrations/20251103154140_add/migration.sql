-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GITHUB', 'ZIP');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'PROGRESSING', 'UPLOADED', 'ANALYZING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "githubUrl" TEXT,
    "githubBranch" TEXT,
    "storageUrl" TEXT,
    "storageKey" TEXT,
    "fillSize" BIGINT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "analysisData" JSONB,
    "language" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
