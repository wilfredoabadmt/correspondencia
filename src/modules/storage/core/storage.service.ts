export interface IStorageService {
    /**
     * Generates a secure, short-lived URL to download a file from the object storage.
     */
    getDownloadUrl(key: string): Promise<string>;

    /**
     * Uploads a file buffer to the object storage and returns the object key.
     */
    uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;

    /**
     * Downloads a file from the object storage and returns its buffer.
     */
    getFileBuffer(key: string): Promise<Buffer>;
}
