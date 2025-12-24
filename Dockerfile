# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY server.js ./
COPY dictionary ./dictionary

# Set environment variable for port
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
