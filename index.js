import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { Video } from "./models/database.js"; 

const app = express();
const port = 8000;


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, and Ogg videos are allowed.'));
    }
  }
});

app.use(cors({ origin: "https://front-media-d4n4qqjyx-anas727189s-projects.vercel.app/", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => res.status(200).send("Hello World!"));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const videoId = uuidv4();
    const videoPath = req.file.path;
    const outputPath = `./uploads/videos/${videoId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    fs.mkdirSync(outputPath, { recursive: true });

    const ffmpegCommand = `ffmpeg -i ${videoPath} \
      -codec:v libx264 -codec:a aac \
      -hls_time 10 -hls_playlist_type vod \
      -hls_segment_filename "${outputPath}/segment%03d.ts" \
      -vf "thumbnail,scale=640:360" -frames:v 1 "${outputPath}/thumbnail.jpg" \
      -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`FFmpeg error: ${error.message}`);
        return res.status(500).json({ message: "Error converting video" });
      }

      
      // Save video metadata in MongoDB
      try {
        const newVideo = new Video({
          title: req.file.originalname,
          description: req.body.description || "No description", 
          videoPath: `https://backend-media-hets.onrender.com/uploads/videos/${videoId}/index.m3u8`,
          thumbnailPath: `https://backend-media-hets.onrender.com/uploads/videos/${videoId}/thumbnail.jpg`,
        });

        await newVideo.save();

        res.status(200).json({
          message: "Video uploaded successfully",
          video: newVideo,
        });
      } catch (err) {
        console.error("Database save error:", err);
        res.status(500).json({ message: "Error saving video metadata" });
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading video" });
  }
});

app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find(); 
    res.status(200).json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Error fetching videos" });
  }
});

app.get("/videos/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      res.status(200).json(video);
    } else {
      res.status(404).json({ message: "Video not found" });
    }
  } catch (err) {
    console.error("Error fetching video:", err);
    res.status(500).json({ message: "Error fetching video" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
