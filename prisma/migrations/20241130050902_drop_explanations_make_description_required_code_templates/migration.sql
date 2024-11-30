/*
  Warnings:

  - You are about to drop the column `explanation` on the `CodeTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CodeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "originalId" INTEGER,
    CONSTRAINT "CodeTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CodeTemplate_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CodeTemplate" ("authorId", "code", "createdAt", "description", "id", "language", "originalId", "title") SELECT "authorId", "code", "createdAt", "description", "id", "language", "originalId", "title" FROM "CodeTemplate";
DROP TABLE "CodeTemplate";
ALTER TABLE "new_CodeTemplate" RENAME TO "CodeTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
