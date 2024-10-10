import mongoose from "mongoose";

mongoose.connect("mongodb+srv://Anas:anaskhan083@cluster0.hvtkj.mongodb.net/video-streaming?retryWrites=true&w=majority")
  .then(() => console.log("Database connected"))
  .catch(err => console.log("Database connection failed", err));

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoPath: String,
    thumbnailPath: String,
    uploadDate: { type: Date, default: Date.now },
});
export const Video = mongoose.model("Video", videoSchema);
