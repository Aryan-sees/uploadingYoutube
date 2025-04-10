# Use a Node base image with ffmpeg preinstalled
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

FROM node:18-alpine

# Install ffmpeg from previous stage
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
