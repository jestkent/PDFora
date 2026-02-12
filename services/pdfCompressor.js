/**
 * PDF Compression Service
 * Uses Ghostscript to compress PDF files with minimal quality loss
 * Modular design allows easy addition of other PDF operations
 */

const { spawn } = require('child_process');
const path = require('path');
const config = require('../config/config');
const fileManager = require('./fileManager');

class PDFCompressor {
    constructor() {
        this.quality = config.compression.defaultQuality;
        this.options = config.compression.options;
    }

    /**
     * Compress a PDF file using Ghostscript
     * @param {string} inputPath - Path to input PDF
     * @param {string} outputPath - Path for compressed PDF
     * @returns {Promise<Object>} Compression results with statistics
     */
    async compress(inputPath, outputPath) {
        try {
            // Get original file size
            const originalSize = await fileManager.getFileSize(inputPath);

            // Build Ghostscript command
            const gsCommand = this._buildGhostscriptCommand(inputPath, outputPath);

            // Execute compression
            await this._executeGhostscript(gsCommand);

            // Get compressed file size
            const compressedSize = await fileManager.getFileSize(outputPath);

            // Calculate compression ratio
            const compressionRatio = this._calculateCompressionRatio(
                originalSize.bytes,
                compressedSize.bytes
            );

            return {
                success: true,
                originalSize: originalSize.formatted,
                compressedSize: compressedSize.formatted,
                originalBytes: originalSize.bytes,
                compressedBytes: compressedSize.bytes,
                compressionRatio: compressionRatio,
                savedBytes: originalSize.bytes - compressedSize.bytes,
                savedFormatted: fileManager.formatBytes(originalSize.bytes - compressedSize.bytes)
            };
        } catch (error) {
            // Check if error is due to Ghostscript not being installed
            if (error.message.includes('Ghostscript not found')) {
                throw error; // Pass through the detailed Ghostscript error
            }
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    /**
     * Build Ghostscript command with all options
     * @private
     */
    _buildGhostscriptCommand(inputPath, outputPath) {
        const args = [
            '-sDEVICE=pdfwrite',
            `-dPDFSETTINGS=${this.quality}`,
            `-sOutputFile=${outputPath}`,
            inputPath
        ];

        // Add additional options from config
        for (const [key, value] of Object.entries(this.options)) {
            if (typeof value === 'boolean') {
                args.unshift(`-${key}`);
            } else {
                args.unshift(`-${key}=${value}`);
            }
        }

        return args;
    }

    /**
     * Execute Ghostscript command
     * @private
     */
    _executeGhostscript(args) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            const path = require('path');

            // List of possible Ghostscript commands and paths to try
            let gsCommands = [];

            // First, check if manual path is configured
            if (config.compression.ghostscriptPath) {
                gsCommands.push(config.compression.ghostscriptPath);
            }

            // Then, try common command names (if in PATH)
            gsCommands.push('gs', 'gswin64c', 'gswin32c');

            // Then, check common Windows installation paths
            if (process.platform === 'win32') {
                const commonPaths = [
                    'C:\\Program Files\\gs',
                    'C:\\Program Files (x86)\\gs',
                    process.env.ProgramFiles + '\\gs',
                    process.env['ProgramFiles(x86)'] + '\\gs'
                ];

                // Search for Ghostscript in common directories
                for (const basePath of commonPaths) {
                    try {
                        if (fs.existsSync(basePath)) {
                            const versions = fs.readdirSync(basePath);
                            for (const version of versions) {
                                const binPath = path.join(basePath, version, 'bin');
                                if (fs.existsSync(binPath)) {
                                    // Add both 64-bit and 32-bit executables
                                    gsCommands.push(path.join(binPath, 'gswin64c.exe'));
                                    gsCommands.push(path.join(binPath, 'gswin32c.exe'));
                                }
                            }
                        }
                    } catch (err) {
                        // Ignore errors reading directories
                    }
                }
            }

            let currentCommandIndex = 0;

            const tryCommand = () => {
                if (currentCommandIndex >= gsCommands.length) {
                    reject(new Error(
                        'Ghostscript not found. Please install Ghostscript and ensure it is in your PATH. ' +
                        'Visit https://www.ghostscript.com/download/gsdnld.html'
                    ));
                    return;
                }

                const command = gsCommands[currentCommandIndex];
                const gs = spawn(command, args);

                let stderr = '';

                gs.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                gs.on('error', (error) => {
                    // Command not found, try next one
                    if (error.code === 'ENOENT') {
                        currentCommandIndex++;
                        tryCommand();
                    } else {
                        reject(error);
                    }
                });

                gs.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        // Try next command if this one failed
                        if (currentCommandIndex < gsCommands.length - 1) {
                            currentCommandIndex++;
                            tryCommand();
                        } else {
                            reject(new Error(`Ghostscript exited with code ${code}: ${stderr}`));
                        }
                    }
                });
            };

            tryCommand();
        });
    }

    /**
     * Calculate compression ratio as percentage
     * @private
     */
    _calculateCompressionRatio(originalBytes, compressedBytes) {
        if (originalBytes === 0) return 0;
        const ratio = ((originalBytes - compressedBytes) / originalBytes) * 100;
        return Math.max(0, Math.round(ratio * 10) / 10); // Round to 1 decimal, min 0
    }

    /**
     * Validate that Ghostscript is installed
     * @returns {Promise<boolean>} True if Ghostscript is available
     */
    async validateGhostscript() {
        try {
            await this._executeGhostscript(['--version']);
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new PDFCompressor();
