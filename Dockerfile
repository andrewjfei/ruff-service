FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm


# development stage
FROM base AS development

# install all dependencies
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

# start the application in development mode
CMD ["pnpm", "run", "start:dev"]


# build stage
FROM base AS build

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# production stage
FROM base AS production

# install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# copy built application from build stage
COPY --from=build /app/dist ./dist

# create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# expose port
EXPOSE 3000

# start the application
CMD ["node", "dist/main"] 