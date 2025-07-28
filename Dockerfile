FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
