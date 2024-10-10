import mongoose from "mongoose";

// Connect to MongoDB using Mongoose
mongoose.connect("mongodb+srv://Anas:anaskhan083@cluster0.hvtkj.mongodb.net/Cluster0?retryWrites=true&w=majority")
  .then(() => console.log("Database connected"))
  .catch(err => console.log("Database connection failed", err));

// Define your schema
const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoPath: String,
    thumbnailPath: String,
    uploadDate: { type: Date, default: Date.now },
});

// Create a model based on the schema
export const Video = mongoose.model("Video", videoSchema);
