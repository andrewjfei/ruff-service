import { Prisma } from "../../prisma/generated/prisma";

export type User = Prisma.UserGetPayload<{
    include: {
        ownedHomes: true;
        homes: {
            include: {
                home: true;
            };
        };
    };
}>;
