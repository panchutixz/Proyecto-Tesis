# syntax=docker/dockerfile:1
FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start", "node", "src/index.js"]