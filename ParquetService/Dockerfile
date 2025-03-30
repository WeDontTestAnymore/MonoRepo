FROM "oven/bun:latest"

WORKDIR /app

COPY package.json .

RUN bun install

COPY . .
EXPOSE 3004

CMD ["bun","run","server.js"]
