// server.js - YouTube to MP3 to Deepgram transcript
const express = require('express');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const { join } = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/transcribe', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing YouTube URL");

  const outputPath = join(tmpdir(), `clip-${Date.now()}.mp3`);
  const cmd = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

  exec(cmd, async (err) => {
    if (err) {
      console.error('yt-dlp error:', err);
      return res.status(500).send("yt-dlp failed");
    }

    try {
      const fileStream = fs.createReadStream(outputPath);
      const response = await axios.post('https://api.deepgram.com/v1/listen?&paragraphs=true&language=en&model=base', fileStream, {
        headers: {
          'Authorization': 'Token 1f7cebcde4a5f35d30458e63cff13b0f141d5456',
          'Content-Type': 'audio/mpeg',
        }
      });

      fs.unlinkSync(outputPath);
      res.json(response.data);
    } catch (e) {
      console.error('Deepgram error:', e);
      res.status(500).send("Deepgram API failed");
    }
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
