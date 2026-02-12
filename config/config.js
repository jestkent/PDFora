/**
 * Centralized configuration for the PDF tool
 * Modify these settings to adjust behavior across the application
 */

const path = require('path');

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        host: 'localhost'
    },

    // File upload settings
    upload: {
        maxFileSize: 250 * 1024 * 1024, // 250 MB in bytes
        allowedMimeTypes: ['application/pdf'],
        uploadDir: path.join(__dirname, '../uploads'),
        compressedDir: path.join(__dirname, '../compressed')
    },

    // File cleanup settings
    cleanup: {
        enabled: true,
        maxFileAge: 60 * 60 * 1000, // 1 hour in milliseconds
        cleanupInterval: 15 * 60 * 1000 // Run cleanup every 15 minutes
    },

    // Compression settings
    compression: {
        // Manual Ghostscript path (optional)
        // If Ghostscript is not in your PATH, specify the full path to the executable here
        // Example for Windows: 'C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe'
        // Leave as null to auto-detect
        ghostscriptPath: 'D:\\ghostscriptforpdftool\\gs10.06.0\\bin\\gswin64c.exe',

        // Ghostscript quality settings
        // /screen (72 dpi) - lowest quality, smallest size
        // /ebook (150 dpi) - moderate quality
        // /printer (300 dpi) - good quality
        // /prepress (300 dpi) - high quality, color preserving
        defaultQuality: '/ebook', // Recommended balance

        // Additional Ghostscript options
        options: {
            dCompatibilityLevel: '1.4',
            dNOPAUSE: true,
            dBATCH: true,
            dSAFER: true,
            dCompressFonts: true,
            dCompressPages: true,
            dOptimize: true,
            dEmbedAllFonts: true,
            dSubsetFonts: true,
            dAutoRotatePages: '/None',
            dColorImageDownsampleType: '/Bicubic',
            dGrayImageDownsampleType: '/Bicubic'
        }
    },

    // Future: Add configurations for other PDF tools
    // merge: { ... },
    // split: { ... },
    // convert: { ... },
    // protect: { ... }
};
