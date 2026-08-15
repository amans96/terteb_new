-- CreateEnum
CREATE TYPE "MenuSection" AS ENUM ('FOOD', 'DRINK');

-- Add section column
ALTER TABLE "MenuCategory"
ADD COLUMN "section" "MenuSection";

-- Remove the old unique constraint
DROP INDEX IF EXISTS "MenuCategory_name_key";

-- Make section required
ALTER TABLE "MenuCategory"
ALTER COLUMN "section" SET NOT NULL;

-- Add the new unique constraint
CREATE UNIQUE INDEX "MenuCategory_name_section_key"
ON "MenuCategory"("name", "section");