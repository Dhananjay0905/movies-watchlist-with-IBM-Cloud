# --- STAGE 1: Build the Frontend ---
FROM node:18-alpine as client_build
WORKDIR /app/client

RUN apk update && apk upgrade --no-cache

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source code and build
COPY client/ ./
RUN npm run build

# --- STAGE 2: Setup the Backend & Final Image ---
FROM node:18-alpine
WORKDIR /app/server

# Copy backend package files and install production dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy backend source code
COPY server/ ./

# Copy the built frontend from Stage 1 into the correct path for the server
COPY --from=client_build /app/client/dist ../client/dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]