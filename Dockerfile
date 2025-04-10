FROM node:18-slim

# Install ffmpeg and other system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
