import multer from "multer";
import path from "path";
import { config } from "../config/env/env.Config.ts";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"];

  const allowedExts = [".zip"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers ZIP sont autorisés"));
  }
};

export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: fileFilter,
});
