import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'tsyringe';

import { env } from '@/core/env';
import type { IStorageService } from '../core/storage.service';

@injectable()
export class R2StorageService implements IStorageService {
    private readonly s3Client: S3Client;
    private readonly BUCKET_NAME = env.R2_BUCKET_NAME;
    private readonly SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

    constructor() {
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: env.R2_ACCESS_KEY_ID,
                secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            },
        });
    }

    async getDownloadUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, {
            expiresIn: this.SIGNED_URL_EXPIRES_IN,
        });
    }

    async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));
        return key;
    }

    async getFileBuffer(key: string): Promise<Buffer> {
        const response = await this.s3Client.send(new GetObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
        }));

        const stream = response.Body;
        if (!stream) throw new Error('Empty response from R2');

        // Use AWS SDK's transformToByteArray for compatibility
        const byteArray = await stream.transformToByteArray();
        return Buffer.from(byteArray);
    }
}
