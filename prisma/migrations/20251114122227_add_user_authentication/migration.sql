-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create a default migration user for existing events
-- Password hash for "migration" (users should change this)
INSERT INTO "User" ("email", "name", "password", "createdAt", "updatedAt") 
VALUES ('migration@example.com', 'Migration User', '$2a$10$rOzJqXqJqXqJqXqJqXqJqOqJqXqJqXqJqXqJqXqJqXqJqXqJqXqJq', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Get the migration user ID (should be 1)
-- Add userId column to Event table (nullable first)
PRAGMA foreign_keys=OFF;
ALTER TABLE "Event" ADD COLUMN "userId" INTEGER;

-- Update all existing events to use the migration user (id = 1)
UPDATE "Event" SET "userId" = 1 WHERE "userId" IS NULL;

-- Now make userId required by recreating the table with the constraint
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isRecurring" BOOLEAN NOT NULL,
    "frequency" TEXT,
    "daysOfWeek" JSONB,
    "recurrenceEndDate" DATETIME,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy all data from old Event table to new one
INSERT INTO "new_Event" ("id", "title", "description", "startDate", "endDate", "isRecurring", "frequency", "daysOfWeek", "recurrenceEndDate", "userId", "createdAt", "updatedAt")
SELECT "id", "title", "description", "startDate", "endDate", "isRecurring", "frequency", "daysOfWeek", "recurrenceEndDate", "userId", "createdAt", "updatedAt" FROM "Event";

-- Drop old table and rename new one
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
