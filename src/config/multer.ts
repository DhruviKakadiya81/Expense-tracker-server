import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/apiError";

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration generator
const createStorage = (subfolder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = path.join(process.cwd(), "uploads", subfolder);
      ensureDirExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

// Image file filter
const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  if (allowedExtensions.test(ext) && (mime.startsWith("image/") || mime.includes("octet-stream"))) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files (JPEG, JPG, PNG, WEBP) are allowed"));
  }
};

// Transaction media file filter (allows images for receipts, videos for video attachments)
const transactionMediaFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.fieldname === "receipt") {
    const allowedExtensions = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Receipt must be an image (JPEG, JPG, PNG, WEBP)"));
    }
  } else if (file.fieldname === "video") {
    const allowedExtensions = /mp4|webm|mov|mkv/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowedExtensions.test(ext) || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Video must be a valid video file (MP4, WEBM, MOV, MKV)"));
    }
  } else {
    cb(null, true);
  }
};

// Dynamic storage for transactions (sorts receipts into uploads/receipts and videos into uploads/videos)
const transactionStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let subfolder = "receipts";
    if (file.fieldname === "video") {
      subfolder = "videos";
    }
    const uploadPath = path.join(process.cwd(), "uploads", subfolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const avatarUpload = multer({
  storage: createStorage("avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const transactionUpload = multer({
  storage: transactionStorage,
  fileFilter: transactionMediaFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to accommodate video
});
