-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER');

-- CreateEnum
CREATE TYPE "TestSessionStatus" AS ENUM ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'INVALID');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('NUMERICAL_SEQUENCE', 'MATRIX_REASONING', 'SPATIAL_ROTATION', 'VERBAL_ANALOGY', 'WORKING_MEMORY', 'PROCESSING_SPEED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "education" "EducationLevel",
    "country" TEXT,
    "language" TEXT DEFAULT 'cs',
    "preferences" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "TestSessionStatus" NOT NULL DEFAULT 'STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "testType" TEXT NOT NULL DEFAULT 'full_iq',
    "timeLimit" INTEGER,
    "questionIds" TEXT[],
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "behaviorData" JSONB,
    "integrityFlags" TEXT[],
    "tabSwitches" INTEGER NOT NULL DEFAULT 0,
    "devToolsOpened" BOOLEAN NOT NULL DEFAULT false,
    "copyPasteEvents" INTEGER NOT NULL DEFAULT 0,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "screenSize" TEXT,
    "timezone" TEXT,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "content" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "discrimination" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "guessing" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "timeLimit" INTEGER,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "averageTime" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mouseMovements" JSONB,
    "keystrokes" JSONB,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "totalScore" INTEGER NOT NULL,
    "iqScore" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL,
    "abilityLevel" DOUBLE PRECISION NOT NULL,
    "standardError" DOUBLE PRECISION NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "personFitIndex" DOUBLE PRECISION,
    "responseConsistency" DOUBLE PRECISION,
    "validityFlags" TEXT[],
    "totalTime" INTEGER NOT NULL,
    "averageTime" DOUBLE PRECISION NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "normGroup" TEXT,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "norm_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ageRange" TEXT,
    "gender" "Gender",
    "education" "EducationLevel",
    "country" TEXT,
    "language" TEXT,
    "sampleSize" INTEGER NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "stdDev" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "percentiles" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "norm_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "responses_sessionId_questionId_key" ON "responses"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_results_sessionId_key" ON "test_results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "norm_groups_name_key" ON "norm_groups"("name");

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
