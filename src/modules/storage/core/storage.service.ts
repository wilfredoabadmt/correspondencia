export interface IStorageService {
    /**
     * Generates a secure, short-lived URL to download a file from the object storage.
     */
    getDownloadUrl(key: string): Promise<string>;
}