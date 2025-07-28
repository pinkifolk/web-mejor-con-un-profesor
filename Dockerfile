FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

ENV PORT=8080

CMD ["node", "./dist/server/entry.mjs"]
