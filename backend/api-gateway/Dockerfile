FROM node:18-alpine

WORKDIR /app

COPY backend/api-gateway/package*.json ./
RUN npm install

COPY backend/api-gateway .

EXPOSE 3000

CMD ["node", "src/app.js"]
