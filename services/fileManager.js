/**
 * File Manager Service
 * Handles file validation, storage, and cleanup operations
 * Designed to be reusable for future PDF tools (merge, split, etc.)
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

class FileManager {
    constructor() {
        this.uploadDir = config.upload.uploadDir;
        this.compressedDir = config.upload.compressedDir;
        this.maxFileAge = config.cleanup.maxFileAge;
    }

    /**
     * Initialize storage directories
     * Creates upload and compressed directories if they don't exist
     */
    async initializeDirectories() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.compressedDir, { recursive: true });
            console.log('✓ Storage directories initialized');
        } catch (error) {
            console.error('Error creating directories:', error);
            throw error;
        }
    }

    /**
     * Validate uploaded file
     * @param {Object} file - Multer file object
     * @returns {Object} Validation result with success status and message
     */
    validateFile(file) {
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }

        // Check file type
        if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
            return { success: false, message: 'Only PDF files are allowed' };
        }

        // Check file size
        if (file.size > config.upload.maxFileSize) {
            const maxSizeMB = config.upload.maxFileSize / (1024 * 1024);
            return {
                success: false,
                message: `File size exceeds ${maxSizeMB} MB limit`
            };
        }

        return { success: true, message: 'File is valid' };
    }

    /**
     * Get file size in human-readable format
     * @param {string} filePath - Path to file
     * @returns {Object} Size in bytes and formatted string
     */
    async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const bytes = stats.size;
            const formatted = this.formatBytes(bytes);
            return { bytes, formatted };
        } catch (error) {
            throw new Error(`Error getting file size: ${error.message}`);
        }
    }

    /**
     * Format bytes to human-readable string
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted string (e.g., "2.5 MB")
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Clean up old files from upload and compressed directories
     * Removes files older than maxFileAge
     */
    async cleanupOldFiles() {
        const now = Date.now();
        let cleanedCount = 0;

        try {
            // Clean upload directory
            cleanedCount += await this._cleanDirectory(this.uploadDir, now);

            // Clean compressed directory
            cleanedCount += await this._cleanDirectory(this.compressedDir, now);

            if (cleanedCount > 0) {
                console.log(`✓ Cleaned up ${cleanedCount} old file(s)`);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    /**
     * Helper method to clean a specific directory
     * @private
     */
    async _cleanDirectory(directory, currentTime) {
        let count = 0;

        try {
            const files = await fs.readdir(directory);

            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                const fileAge = currentTime - stats.mtimeMs;

                if (fileAge > this.maxFileAge) {
                    await fs.unlink(filePath);
                    count++;
                }
            }
        } catch (error) {
            // Directory might not exist yet, ignore
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        return count;
    }

    /**
     * Delete a specific file
     * @param {string} filePath - Path to file to delete
     */
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            console.log(`✓ Deleted file: ${path.basename(filePath)}`);
        } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error);
        }
    }

    /**
     * Check if file exists
     * @param {string} filePath - Path to file
     * @returns {boolean} True if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = new FileManager();
