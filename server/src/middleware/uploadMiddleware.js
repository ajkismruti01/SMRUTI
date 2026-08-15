import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import { config } from '../config/environment.js';

const isCloudinaryConfigured = Boolean(
  config.cloudinary.url ||
    (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)
);

// Fallback disk storage if Cloudinary is not configured or during local tests
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const cloudinaryStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        let resource_type = 'auto';
        let folder = 'smruti_media';

        if (file.mimetype.startsWith('image/')) {
          resource_type = 'image';
          folder = 'smruti_images';
        } else if (file.mimetype.startsWith('audio/')) {
          resource_type = 'video'; // Cloudinary uses video resource_type for audio
          folder = 'smruti_audio';
        } else if (file.mimetype.startsWith('video/')) {
          resource_type = 'video';
          folder = 'smruti_videos';
        } else {
          resource_type = 'raw';
          folder = 'smruti_docs';
        }

        return {
          folder,
          resource_type,
          public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`,
        };
      },
    })
  : diskStorage;

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/m4a',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: config.uploadLimits.maxVideoSize, // max upper limit
  },
  fileFilter,
});
