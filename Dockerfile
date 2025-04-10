# Use an official lightweight Node.js image
FROM node:18-slim

# Install ffmpeg and yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3 \
 && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose server port
EXPOSE 5050

# Run the app
CMD ["npm", "start"]
