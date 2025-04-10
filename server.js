const express = require('express');
const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/transcribe', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing 'url' in request body");

  const tempId = uuidv4();
  const videoPath = `/tmp/video-${tempId}.mp4`;
  const audioPath = `/tmp/audio-${tempId}.mp3`;

  try {
    console.log("⬇️ Downloading video from Drive...");
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(videoPath);
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log("🎧 Extracting MP3 from video...");
    execSync(`ffmpeg -y -i ${videoPath} -vn -acodec libmp3lame -ar 44100 -ac 2 -b:a 192k ${audioPath}`);

    console.log("🧠 Sending to Deepgram...");
    const audioStream = fs.createReadStream(audioPath);
    const dgResponse = await axios.post(
      'https://api.deepgram.com/v1/listen?topics=true&smart_format=true&paragraphs=true&language=en&model=base',
      audioStream,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mpeg',
        },
      }
    );

    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    res.json(dgResponse.data);

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).send("Deepgram or ffmpeg failed");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
