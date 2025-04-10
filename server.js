const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();


const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const audioPath = `${filePath}.mp3`;

    console.log("🔊 Extracting audio from MP4...");
    execSync(`ffmpeg -y -i ${filePath} -vn -acodec libmp3lame -ar 44100 -ac 2 -b:a 192k ${audioPath}`);

    console.log("🎙️ Sending to Deepgram...");
    const fileStream = fs.createReadStream(audioPath);
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen?topics=true&smart_format=true&paragraphs=true&language=en&model=base',
      fileStream,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mpeg',
        },
      }
    );

    fs.unlinkSync(filePath);
    fs.unlinkSync(audioPath);
    res.json(response.data);

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).send("Transcription failed");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
