# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend ./

# Expose the backend port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "dev"]
