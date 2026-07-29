import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';

export const PRODUCT_UPLOAD_DIRECTORY = join(
  process.cwd(),
  'uploads',
  'products',
);
export const PRODUCT_UPLOAD_URL_PREFIX = '/uploads/products/';
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const productImageUploadOptions = {
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      mkdirSync(PRODUCT_UPLOAD_DIRECTORY, { recursive: true });
      callback(null, PRODUCT_UPLOAD_DIRECTORY);
    },
    filename: (_request, file, callback) => {
      const extension = extensionByMimeType[file.mimetype];

      if (!extension) {
        callback(new BadRequestException('Unsupported image type.'), '');
        return;
      }

      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: MAX_PRODUCT_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.originalname?.trim()) {
      callback(new BadRequestException('Image file is required.'), false);
      return;
    }

    if (!extensionByMimeType[file.mimetype]) {
      callback(
        new BadRequestException(
          'Only JPEG, PNG and WebP images are supported.',
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
