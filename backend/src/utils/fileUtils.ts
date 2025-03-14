import fs from "fs";
import path from "path";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await unlinkAsync(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  await Promise.all(filePaths.map(deleteFile));
};

export const getUploadPath = (filename: string): string => {
  return path.join(__dirname, "../../uploads", filename);
};

export const ensureUploadDir = (): void => {
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

export const isValidImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  return allowedMimeTypes.includes(file.mimetype);
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};
