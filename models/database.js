import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/video-streaming")
  .then(() => console.log("Database connected"))
  .catch(err => console.log("Database connection failed", err));


const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoPath: String,
    thumbnailPath: String,
    uploadDate: { type: Date, default: Date.now },
})

export const Video = mongoose.model("Video", videoSchema)