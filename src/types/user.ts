import { Prisma } from "src/../prisma/generated/prisma";

export type User = Prisma.UserGetPayload<{
    include: {
        homes: true;
    };
}>;
