const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const app = express();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use a unique filename with timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only mp4 and mkv files
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/x-matroska') {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 and MKV files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://prajwal01532:prajwal@mp4convertermp3.laay1.mongodb.net/?retryWrites=true&w=majority&appName=Mp4ConverterMp3');

// Create a schema for converted files
const convertedFileSchema = new mongoose.Schema({
  originalName: String,
  convertedName: String,
  convertedPath: String,
  createdAt: { type: Date, default: Date.now }
});

const ConvertedFile = mongoose.model('ConvertedFile', convertedFileSchema);

// Ensure converted directory exists
if (!fs.existsSync('converted')) {
  fs.mkdirSync('converted');
}

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputFileName = `${Date.now()}-converted.mp3`;
  const outputPath = path.join('converted', outputFileName);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate('192k') // Set good quality audio
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log('Conversion finished');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error:', err);
          reject(err);
        })
        .save(outputPath);
    });

    // Save to database
    const convertedFile = new ConvertedFile({
      originalName: req.file.originalname,
      convertedName: outputFileName,
      convertedPath: outputPath
    });
    await convertedFile.save();

    // Set headers for download
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(req.file.originalname).name}.mp3"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up files after sending
    fileStream.on('end', () => {
      fs.unlink(inputPath, (err) => {
        if (err) console.error('Error deleting input file:', err);
      });
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting output file:', err);
      });
    });

  } catch (error) {
    console.error('Conversion error:', error);
    // Clean up input file on error
    fs.unlink(inputPath, (err) => {
      if (err) console.error('Error deleting input file:', err);
    });
    res.status(500).json({ error: 'Conversion failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});