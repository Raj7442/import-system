FROM node:18-alpine

WORKDIR /app

# Copy package files (already in api-gateway directory)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (already in api-gateway directory)
COPY . ./

EXPOSE 3000

CMD ["node", "src/app.js"]