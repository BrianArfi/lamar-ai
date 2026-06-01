-- CreateTable
CREATE TABLE "ScrapedJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserJobMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scrapedJobId" TEXT NOT NULL,
    "fitScore" REAL NOT NULL,
    "reportText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserJobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserJobMatch_scrapedJobId_fkey" FOREIGN KEY ("scrapedJobId") REFERENCES "ScrapedJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedJob_externalId_key" ON "ScrapedJob"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "UserJobMatch_userId_scrapedJobId_key" ON "UserJobMatch"("userId", "scrapedJobId");
