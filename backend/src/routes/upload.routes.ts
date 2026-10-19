import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { config } from "../config";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type. Only images are allowed.", 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize },
});

router.use(authenticate);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }
    const url = `/uploads/${req.file.filename}`;
    sendSuccess(res, { url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype }, "File uploaded", 201);
  })
);

router.post(
  "/multiple",
  upload.array("files", 10),
  asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    sendSuccess(res, { urls }, "Files uploaded", 201);
  })
);

export { router as uploadRoutes };
export default router;
