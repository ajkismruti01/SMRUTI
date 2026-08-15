import { Media } from '../models/Media.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { config } from '../config/environment.js';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const familyId = req.family._id;
    const file = req.file;

    let mediaType = 'image';
    if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
    else if (file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (file.mimetype === 'application/pdf') mediaType = 'document';

    // If Cloudinary stored file, file.path contains URL. If disk storage, construct URL.
    const fileUrl = file.path.startsWith('http')
      ? file.path
      : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    const media = await Media.create({
      familyId,
      uploadedBy: req.user._id,
      type: mediaType,
      url: fileUrl,
      publicId: file.filename || file.public_id || '',
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size || 0,
    });

    return successResponse(
      res,
      {
        url: fileUrl,
        mediaId: media._id,
        type: mediaType,
        originalName: file.originalname,
      },
      'Media uploaded successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
