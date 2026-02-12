/**
 * PDF Compression Tool - Main Server
 * Express server with modular architecture for PDF operations
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const fileManager = require('./services/fileManager');
const pdfCompressor = require('./services/pdfCompressor');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.upload.uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'upload-' + uniqueSuffix + '.pdf');
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PDF Compression Tool is running' });
});

// Upload and compress PDF
app.post('/api/compress', upload.single('pdf'), async (req, res) => {
    try {
        // Validate file
        const validation = fileManager.validateFile(req.file);
        if (!validation.success) {
            // Clean up uploaded file if validation fails
            if (req.file) {
                await fileManager.deleteFile(req.file.path);
            }
            return res.status(400).json({ error: validation.message });
        }

        const inputPath = req.file.path;

        // Generate output filename: comp + first 8 chars of original name
        const originalName = req.file.originalname.replace('.pdf', '');
        const namePrefix = originalName.substring(0, 8);
        const timestamp = Date.now();
        const outputFilename = `comp${namePrefix}-${timestamp}.pdf`;
        const outputPath = path.join(config.upload.compressedDir, outputFilename);

        // Compress the PDF
        const result = await pdfCompressor.compress(inputPath, outputPath);

        // Delete original uploaded file
        await fileManager.deleteFile(inputPath);

        // Send response with compression results
        res.json({
            success: true,
            filename: outputFilename,
            originalName: req.file.originalname,
            ...result
        });

    } catch (error) {
        console.error('Compression error:', error);

        // Clean up files on error
        if (req.file) {
            await fileManager.deleteFile(req.file.path);
        }

        // Provide helpful error message
        let errorMessage = 'Failed to compress PDF. Please ensure the file is a valid PDF.';

        if (error.message.includes('Ghostscript not found')) {
            errorMessage = 'Ghostscript is not installed. Please install Ghostscript to enable PDF compression. Visit: https://www.ghostscript.com/download/gsdnld.html';
        }

        res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
});

// Download compressed PDF
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(config.upload.compressedDir, filename);

        // Check if file exists
        const exists = await fileManager.fileExists(filePath);
        if (!exists) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Send file for download with clean name
        res.download(filePath, filename, async (err) => {
            if (err) {
                console.error('Download error:', err);
            } else {
                // Delete file after successful download
                await fileManager.deleteFile(filePath);
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

/**
 * Server initialization
 */
async function startServer() {
    try {
        // Initialize storage directories
        await fileManager.initializeDirectories();

        // Validate Ghostscript installation
        const gsInstalled = await pdfCompressor.validateGhostscript();
        if (!gsInstalled) {
            console.warn('⚠ WARNING: Ghostscript not detected. PDF compression will not work.');
            console.warn('Please install Ghostscript from: https://www.ghostscript.com/download/gsdnld.html');
        } else {
            console.log('✓ Ghostscript detected');
        }

        // Start cleanup scheduler if enabled
        if (config.cleanup.enabled) {
            setInterval(() => {
                fileManager.cleanupOldFiles();
            }, config.cleanup.cleanupInterval);
            console.log('✓ File cleanup scheduler started');
        }

        // Start server
        app.listen(config.server.port, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚀 PDF Compression Tool Server Running');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📍 URL: http://${config.server.host}:${config.server.port}`);
            console.log(`📁 Upload limit: ${config.upload.maxFileSize / (1024 * 1024)} MB`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
