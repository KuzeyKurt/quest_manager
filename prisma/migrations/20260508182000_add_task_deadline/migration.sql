-- Add missing deadline column to Task table
ALTER TABLE "Task"
ADD COLUMN "deadline" TIMESTAMP(3);
