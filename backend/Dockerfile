FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
