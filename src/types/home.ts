import { Prisma } from "prisma/generated/prisma";

export type Home = Prisma.HomeGetPayload<{
    include: {
        pets: true;
    };
}>;

export type HomeCreateData = {
    name: string;
    ownerId: string;
};
