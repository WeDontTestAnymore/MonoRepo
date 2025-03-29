FROM "oven/bun:latest"

WORKDIR /app


COPY package.json .

RUN bun install

COPY . .

RUN bunx prisma generate

RUN mkdir logs

RUN touch logs/app.log

CMD ["bun","run","dev"]
