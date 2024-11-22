import { Injectable, InternalServerErrorException, Logger, OnModuleInit, BadRequestException, UnsupportedMediaTypeException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createId } from "@paralleldrive/cuid2";
import { MinioClient, MinioService } from "nestjs-minio-client";
import sharp from "sharp";
import * as FileType from 'file-type';
import * as path from 'path';
import * as crypto from 'crypto';

import { Config } from "../config/schema";

// Objects are stored under the following path in the bucket:
// "<bucketName>/<userId>/<type>/<fileName>",
// where `userId` is a unique identifier (cuid) for the user,
// where `type` can either be "pictures", "previews" or "resumes",
// and where `fileName` is a unique identifier (cuid) for the file.

type ImageUploadType = "pictures" | "previews";
type DocumentUploadType = "resumes";
export type UploadType = ImageUploadType | DocumentUploadType;

const PUBLIC_ACCESS_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicAccess",
      Effect: "Allow",
      Action: ["s3:GetObject"],
      Principal: { AWS: ["*"] },
      Resource: [
        "arn:aws:s3:::{{bucketName}}/*/pictures/*",
        "arn:aws:s3:::{{bucketName}}/*/previews/*",
        "arn:aws:s3:::{{bucketName}}/*/resumes/*",
      ],
    },
  ],
} as const;

const MAX_FILE_SIZES = {
  pictures: 5 * 1024 * 1024, // 5MB for pictures
  previews: 2 * 1024 * 1024, // 2MB for previews
  resumes: 10 * 1024 * 1024, // 10MB for resumes
} as const;

const BLOCKED_FILE_EXTENSIONS = [
  // Executable files
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.msi', '.com', '.app',
  // Script files
  '.js', '.php', '.asp', '.aspx', '.jsp', '.cgi', '.py', '.pl', '.rb',
  // System files
  '.sys', '.drv', '.bin', '.vbs', '.ps1', '.scr',
  // Archive files that might contain executables
  '.jar', '.war',
  // Other potentially dangerous files
  '.reg', '.inf'
] as const;

const ALLOWED_FILE_TYPES = {
  pictures: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif']
  },
  previews: {
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
  },
  resumes: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf']
  }
} as const;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  private client: MinioClient;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly minioService: MinioService,
  ) {}

  async onModuleInit() {
    this.client = this.minioService.client;
    this.bucketName = this.configService.getOrThrow<string>("STORAGE_BUCKET");

    const skipBucketCheck = this.configService.getOrThrow<boolean>("STORAGE_SKIP_BUCKET_CHECK");

    if (skipBucketCheck) {
      this.logger.warn("Skipping the verification of whether the storage bucket exists.");
      this.logger.warn(
        "Make sure that the following paths are publicly accessible: `/{pictures,previews,resumes}/*`",
      );

      return;
    }

    try {
      // Create a storage bucket if it doesn't exist
      // if it exists, log that we were able to connect to the storage service
      const bucketExists = await this.client.bucketExists(this.bucketName);

      if (bucketExists) {
        this.logger.log("Successfully connected to the storage service.");
      } else {
        const bucketPolicy = JSON.stringify(PUBLIC_ACCESS_POLICY).replace(
          /{{bucketName}}/g,
          this.bucketName,
        );

        try {
          await this.client.makeBucket(this.bucketName);
        } catch {
          throw new InternalServerErrorException(
            "There was an error while creating the storage bucket.",
          );
        }

        try {
          await this.client.setBucketPolicy(this.bucketName, bucketPolicy);
        } catch {
          throw new InternalServerErrorException(
            "There was an error while applying the policy to the storage bucket.",
          );
        }

        this.logger.log(
          "A new storage bucket has been created and the policy has been applied successfully.",
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async bucketExists() {
    const exists = await this.client.bucketExists(this.bucketName);

    if (!exists) {
      throw new InternalServerErrorException(
        "There was an error while checking if the storage bucket exists.",
      );
    }
  }

  private async validateFile(buffer: Buffer, type: UploadType, filename: string): Promise<void> {
    // 1. Check file size
    if (buffer.length > MAX_FILE_SIZES[type]) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZES[type] / (1024 * 1024)}MB`
      );
    }

    // 2. Check file extension
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Block dangerous file types
    if (BLOCKED_FILE_EXTENSIONS.includes(fileExtension as any)) {
      throw new UnsupportedMediaTypeException(
        `File type ${fileExtension} is blocked for security reasons`
      );
    }

    // Verify extension matches allowed types
    if (!ALLOWED_FILE_TYPES[type].extensions.includes(fileExtension as any)) {
      throw new UnsupportedMediaTypeException(
        `File extension ${fileExtension} is not allowed for ${type}. Allowed extensions: ${ALLOWED_FILE_TYPES[type].extensions.join(', ')}`
      );
    }

    // 3. Verify actual file content type
    const fileType = await FileType.fromBuffer(buffer);
    if (!fileType) {
      throw new UnsupportedMediaTypeException('Could not determine file type from content');
    }

    // Verify MIME type matches allowed types
    if (!ALLOWED_FILE_TYPES[type].mimeTypes.includes(fileType.mime)) {
      throw new UnsupportedMediaTypeException(
        `File content type ${fileType.mime} does not match allowed types for ${type}`
      );
    }

    // 4. Additional validation for images
    if (type === 'pictures' || type === 'previews') {
      try {
        // Verify image can be processed
        await sharp(buffer).metadata();
      } catch (error) {
        throw new UnsupportedMediaTypeException('Invalid image file');
      }
    }

    // 5. Calculate file hash for logging
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    this.logger.log(`Validated file: ${filename} (${fileType.mime}, ${buffer.length} bytes, hash: ${fileHash.substring(0, 8)}...)`);
  }

  async uploadObject(
    userId: string,
    type: UploadType,
    buffer: Buffer,
    filename: string = createId(),
  ) {
    try {
      // Validate file before processing
      await this.validateFile(buffer, type, filename);

      // Generate a secure filename
      const fileType = await FileType.fromBuffer(buffer);
      const secureFilename = `${filename}.${fileType.ext}`.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${userId}/${type}/${secureFilename}`;

      try {
        await this.client.putObject({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: fileType.mime,
          Metadata: {
            'Original-Filename': filename,
            'Upload-Date': new Date().toISOString(),
            'User-ID': userId,
          },
        });

        return {
          filename: secureFilename,
          url: `${this.configService.get<string>('STORAGE_URL')}/${key}`,
        };
      } catch (error) {
        this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to upload file');
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteObject(userId: string, type: UploadType, filename: string) {
    const extension = type === "resumes" ? "pdf" : "jpg";
    const path = `${userId}/${type}/${filename}.${extension}`;

    try {
      await this.client.removeObject(this.bucketName, path);
      return;
    } catch {
      throw new InternalServerErrorException(
        `There was an error while deleting the document at the specified path: ${path}.`,
      );
    }
  }

  async deleteFolder(prefix: string) {
    const objectsList = [];

    const objectsStream = this.client.listObjectsV2(this.bucketName, prefix, true);

    for await (const object of objectsStream) {
      objectsList.push(object.name);
    }

    try {
      await this.client.removeObjects(this.bucketName, objectsList);
      return;
    } catch {
      throw new InternalServerErrorException(
        `There was an error while deleting the folder at the specified path: ${this.bucketName}/${prefix}.`,
      );
    }
  }
}
