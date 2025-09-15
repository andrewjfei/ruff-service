import { Prisma } from "prisma/generated/prisma";

export type User = Prisma.UserGetPayload<{
    include: {
        homes: true;
    };
}>;
