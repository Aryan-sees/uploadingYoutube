FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# App setup
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Environment & port
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
