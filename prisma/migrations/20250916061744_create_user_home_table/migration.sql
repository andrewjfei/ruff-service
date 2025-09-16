-- CreateTable
CREATE TABLE "user_home" (
    "userId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,

    CONSTRAINT "user_home_pkey" PRIMARY KEY ("userId","homeId")
);

-- AddForeignKey
ALTER TABLE "user_home" ADD CONSTRAINT "user_home_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_home" ADD CONSTRAINT "user_home_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
