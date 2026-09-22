FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:16-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist

COPY ecosystem.config.js ./

EXPOSE 3001

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
