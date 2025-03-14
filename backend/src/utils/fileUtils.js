const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);

const deleteFile = async (filePath) => {
  try {
    await unlinkAsync(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

const deleteFiles = async (filePaths) => {
  await Promise.all(filePaths.map(deleteFile));
};

const getUploadPath = (filename) => {
  return path.join(__dirname, "../../uploads", filename);
};

const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};

const isValidImageFile = (file) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  return allowedMimeTypes.includes(file.mimetype);
};

const formatFileSize = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};

module.exports = {
  deleteFile,
  deleteFiles,
  getUploadPath,
  ensureUploadDir,
  getFileUrl,
  isValidImageFile,
  formatFileSize,
};
