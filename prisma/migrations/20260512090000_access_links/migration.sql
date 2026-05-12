ALTER TABLE "User" ADD COLUMN "accessToken" TEXT;

UPDATE "User"
SET "accessToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "accessToken" IS NULL;

ALTER TABLE "User" ALTER COLUMN "accessToken" SET NOT NULL;

CREATE UNIQUE INDEX "User_accessToken_key" ON "User"("accessToken");
