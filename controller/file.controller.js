import File_ from "../model/file.model.js";
import cloudinary from "../config/cloud.js";

export const addFile = async (req, res) => {
  try {
    const { title, author, desc, language } = req.body;

    // 🧩 Validate required fields
    if (!title || !author || !desc || !language) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    let fileUrl = undefined;

    // 🧠 Upload file to Cloudinary (only if provided)
    if (req.file) {
      try {
        const fileBuffer = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(fileBuffer, {
          folder: "files",
          resource_type: "raw", // ✅ for PDF, DOC, PPT, etc.
        });

        fileUrl = uploadResult.secure_url; // ✅ store URL for DB
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({
          success: false,
          message: "File upload failed",
          error: error.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // 🧩 Save file data in MongoDB
    const newFile = await File_.create({
      title,
      author,
      desc,
      language,
      fileUrl, // ✅ now this is saved in DB
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded and saved successfully",
      newFile,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get all files (includes fileUrl)
export const getAllFiles = async (req, res) => {
  try {
    const files = await File_.find();

    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Get All Files Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get a single file by ID (includes fileUrl)
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File_.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("Get File By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
