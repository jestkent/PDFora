/**
 * PDF Compression Tool - Frontend Application
 * Handles file upload, compression, and download with modern UI interactions
 */

// DOM Elements
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');

const uploadSection = document.getElementById('upload-section');
const fileInfoSection = document.getElementById('file-info-section');
const processingSection = document.getElementById('processing-section');
const resultSection = document.getElementById('result-section');
const errorSection = document.getElementById('error-section');

const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file-btn');
const compressBtn = document.getElementById('compress-btn');

const originalSizeEl = document.getElementById('original-size');
const compressedSizeEl = document.getElementById('compressed-size');
const savedSizeEl = document.getElementById('saved-size');
const compressionRatioEl = document.getElementById('compression-ratio');
const downloadBtn = document.getElementById('download-btn');
const compressAnotherBtn = document.getElementById('compress-another-btn');

const errorMessage = document.getElementById('error-message');
const tryAgainBtn = document.getElementById('try-again-btn');

const progressCircle = document.getElementById('progress-circle');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');
const currentFileEl = document.getElementById('current-file');
const totalFilesEl = document.getElementById('total-files');
const processingTitle = document.getElementById('processing-title');
const processingStatus = document.getElementById('processing-status');

// State
let selectedFiles = [];
let compressedFiles = [];
const MAX_FILES = 3;

// API Base URL
const API_BASE = window.location.origin;

/**
 * Initialize event listeners
 */
function init() {
    // Upload zone click
    uploadZone.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);

    // Buttons
    removeFileBtn.addEventListener('click', resetToUpload);
    compressBtn.addEventListener('click', compressPDF);
    downloadBtn.addEventListener('click', downloadPDF);
    compressAnotherBtn.addEventListener('click', resetToUpload);
    tryAgainBtn.addEventListener('click', resetToUpload);
}

/**
 * Handle file selection from input
 */
function handleFileSelect(e) {
    const files = Array.from(e.target.files).slice(0, MAX_FILES);
    if (files.length > 0) {
        processFiles(files);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files)
        .filter(f => f.type === 'application/pdf')
        .slice(0, MAX_FILES);

    if (files.length > 0) {
        processFiles(files);
    }
}

/**
 * Process selected files
 */
function processFiles(files) {
    // Validate each file
    const validFiles = [];
    const maxSize = 250 * 1024 * 1024;

    for (const file of files) {
        if (file.type !== 'application/pdf') {
            showError('Only PDF files are allowed');
            return;
        }
        if (file.size > maxSize) {
            showError(`File "${file.name}" exceeds 250 MB limit`);
            return;
        }
        validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    selectedFiles = validFiles;

    // Update UI
    if (validFiles.length === 1) {
        fileName.textContent = validFiles[0].name;
        fileSize.textContent = formatBytes(validFiles[0].size);
    } else {
        fileName.textContent = `${validFiles.length} PDF files selected`;
        const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
        fileSize.textContent = formatBytes(totalSize);
    }

    showSection('file-info');
}

/**
 * Compress PDFs with progress animation
 */
async function compressPDF() {
    if (selectedFiles.length === 0) return;

    showSection('processing');
    compressedFiles = [];

    // Update UI for batch processing
    totalFilesEl.textContent = selectedFiles.length;
    processingTitle.textContent = selectedFiles.length === 1
        ? 'Compressing your PDF...'
        : 'Compressing your PDFs...';

    try {
        // Process files in batches of 3 (parallel processing)
        const results = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            currentFileEl.textContent = i + 1;

            // Animate progress
            const progress = ((i + 1) / selectedFiles.length) * 100;
            updateProgress(progress);

            const file = selectedFiles[i];
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch(`${API_BASE}/api/compress`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Compression failed');
            }

            results.push(data);
            compressedFiles.push(data);
        }

        // Calculate totals
        const totalOriginal = results.reduce((sum, r) => sum + r.originalBytes, 0);
        const totalCompressed = results.reduce((sum, r) => sum + r.compressedBytes, 0);
        const totalSaved = totalOriginal - totalCompressed;
        const avgRatio = ((totalSaved / totalOriginal) * 100).toFixed(1);

        // Update result UI
        originalSizeEl.textContent = formatBytes(totalOriginal);
        compressedSizeEl.textContent = formatBytes(totalCompressed);
        savedSizeEl.textContent = formatBytes(totalSaved);
        compressionRatioEl.textContent = avgRatio + '%';

        // Update download button for multiple files
        if (selectedFiles.length > 1) {
            downloadBtn.textContent = `Download ${selectedFiles.length} Compressed PDFs`;
        }

        showSection('result');

    } catch (error) {
        console.error('Compression error:', error);
        showError(error.message || 'Failed to compress PDF. Please try again.');
    }
}

/**
 * Update progress indicator
 */
function updateProgress(percent) {
    const circumference = 220;
    const offset = circumference - (percent / 100) * circumference;

    progressCircle.style.strokeDashoffset = offset;
    progressPercent.textContent = Math.round(percent) + '%';
    progressBar.style.width = percent + '%';
}

/**
 * Download compressed PDFs
 */
async function downloadPDF() {
    if (compressedFiles.length === 0) return;

    try {
        // Download each file
        for (const fileData of compressedFiles) {
            const downloadUrl = `${API_BASE}/api/download/${fileData.filename}`;

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileData.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Small delay between downloads to avoid browser blocking
            if (compressedFiles.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        // Show success feedback
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 6L8 14L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Downloaded!
    `;

        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
        }, 2000);

    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download files. Please try again.');
    }
}

/**
 * Show specific section and hide others
 */
function showSection(section) {
    uploadSection.classList.add('hidden');
    fileInfoSection.classList.add('hidden');
    processingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    switch (section) {
        case 'upload':
            uploadSection.classList.remove('hidden');
            break;
        case 'file-info':
            fileInfoSection.classList.remove('hidden');
            break;
        case 'processing':
            processingSection.classList.remove('hidden');
            break;
        case 'result':
            resultSection.classList.remove('hidden');
            break;
        case 'error':
            errorSection.classList.remove('hidden');
            break;
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    showSection('error');
}

/**
 * Reset to upload state
 */
function resetToUpload() {
    selectedFiles = [];
    compressedFiles = [];
    fileInput.value = '';
    updateProgress(0);
    downloadBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 13V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Download Compressed PDF
  `;
    showSection('upload');
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
