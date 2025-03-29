/*
  Warnings:

  - You are about to drop the column `deuDate` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "deuDate",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
