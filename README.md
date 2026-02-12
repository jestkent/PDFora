# 🗜️ PDF Compressor - Free Unlimited PDF Compression Tool

A modern, production-ready web application for compressing PDF files with no size limits or paywalls. Built as a free alternative to commercial PDF tools that restrict file sizes.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Ghostscript](https://img.shields.io/badge/Ghostscript-8B5CF6?style=flat-square)

## 💡 Why I Built This

I needed to compress large PDF files (200+ MB) but popular online tools like iLovePDF require payment for files over 100 MB. Instead of paying for a subscription, I decided to build my own solution with **no file size limits** and **complete privacy**. This tool is completely free and open-source.

## ✨ Features

- 🗜️ **Smart Compression** - Reduces PDF file size while preserving quality using Ghostscript
- 📦 **Batch Processing** - Compress up to 3 PDFs simultaneously
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations and progress indicators
- 📤 **Drag & Drop** - Easy file upload with visual feedback
- 📊 **Size Comparison** - See original vs compressed file sizes with compression ratio
- 🔒 **Privacy First** - Files automatically deleted after 1 hour, no permanent storage
- 🚀 **No Limits** - Upload files up to 250 MB (configurable to any size)
- 💰 **100% Free** - No subscriptions, no paywalls, no tracking
- 📱 **Mobile Friendly** - Fully responsive design works on all devices

## 🎯 Live Demo

![PDF Compressor Demo](screenshot-placeholder.png)

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Ghostscript** (required for PDF compression)
  - **Windows**: [Download installer](https://www.ghostscript.com/download/gsdnld.html)
  - **macOS**: `brew install ghostscript`
  - **Linux**: `sudo apt-get install ghostscript`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jestkent/PDFora.git
   cd PDFora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Ghostscript path** (if not in PATH)
   
   Edit `config/config.js` and set the `ghostscriptPath`:
   ```javascript
   ghostscriptPath: 'C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe'
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 Usage

1. **Upload PDFs** - Drag and drop up to 3 PDF files or click to browse
2. **Watch Progress** - Beautiful animated progress indicator shows compression status
3. **Download** - Get your compressed PDFs with clean filenames (`compFilename-timestamp.pdf`)
4. **Repeat** - Compress as many files as you need, completely free!

## 📁 Project Structure

```
pdf-compressor/
├── config/
│   └── config.js           # Centralized configuration
├── services/
│   ├── fileManager.js      # File operations and cleanup
│   └── pdfCompressor.js    # PDF compression logic
├── public/
│   ├── css/
│   │   └── style.css       # Modern UI styles
│   ├── js/
│   │   └── app.js          # Frontend logic
│   └── index.html          # Main HTML page
├── server.js               # Express server
├── package.json            # Dependencies
└── README.md               # This file
```

## ⚙️ Configuration

Edit `config/config.js` to customize:

```javascript
{
  server: {
    port: 3000                    // Server port
  },
  upload: {
    maxFileSize: 250 * 1024 * 1024  // Max file size (250 MB)
  },
  compression: {
    ghostscriptPath: null,        // Manual Ghostscript path
    defaultQuality: '/ebook'      // Compression quality
  },
  cleanup: {
    maxFileAge: 60 * 60 * 1000,   // Delete files after 1 hour
    cleanupInterval: 15 * 60 * 1000 // Run cleanup every 15 min
  }
}
```

### Compression Quality Options

- `/screen` - 72 DPI (smallest size, lowest quality)
- `/ebook` - 150 DPI (balanced - **recommended**)
- `/printer` - 300 DPI (good quality)
- `/prepress` - 300 DPI (high quality, color preserving)

## 🔧 Technical Details

### How Compression Works

The tool uses **Ghostscript** to intelligently reduce PDF file size:

1. **Image Optimization** - Downscales and recompresses images with smart DPI reduction
2. **Metadata Removal** - Removes unnecessary metadata while preserving document structure
3. **Font Subsetting** - Embeds only used characters from fonts
4. **Stream Compression** - Optimizes internal PDF streams
5. **Quality Preservation** - Maintains text clarity and vector graphics

### API Endpoints

#### `POST /api/compress`
Upload and compress a PDF file.

**Request:** `multipart/form-data` with `pdf` field

**Response:**
```json
{
  "success": true,
  "filename": "compMyDocume-1770873453123.pdf",
  "originalSize": "5.2 MB",
  "compressedSize": "1.8 MB",
  "compressionRatio": 65.4,
  "savedFormatted": "3.4 MB"
}
```

#### `GET /api/download/:filename`
Download a compressed PDF file.

## 🔐 Security & Privacy

- ✅ Files stored temporarily in `uploads/` and `compressed/` directories
- ✅ Automatic deletion after download
- ✅ Old files (>1 hour) cleaned up every 15 minutes
- ✅ No permanent file storage
- ✅ No user tracking or analytics
- ✅ No file content logging

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes with purple/blue gradients
- **Glassmorphism** - Modern frosted glass effect on cards
- **Smooth Animations** - Floating icons, shimmer effects, progress rings
- **Circular Progress Ring** - Shows compression progress percentage
- **Batch Upload** - Handle multiple files with live status updates
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🚧 Future Enhancements

Potential features to add:

- [ ] PDF Merge - Combine multiple PDFs into one
- [ ] PDF Split - Extract pages or split into multiple files
- [ ] PDF to Word - Convert PDFs to editable documents
- [ ] PDF Protect - Add password protection
- [ ] PDF to Image - Convert pages to images
- [ ] Rotate Pages - Rotate PDF pages
- [ ] Cloud Storage Integration - Save to Google Drive, Dropbox
- [ ] Docker Support - Easy deployment with containers

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - Free to use for personal or commercial purposes.

## 🙏 Acknowledgments

- [Express](https://expressjs.com/) - Web framework
- [Multer](https://github.com/expressjs/multer) - File upload handling
- [Ghostscript](https://www.ghostscript.com/) - PDF processing engine
- [Inter Font](https://fonts.google.com/specimen/Inter) - Typography

## 💼 About

Built by a developer who believes in free, open-source tools. No paywalls, no limits, just a simple solution to a common problem.

**If you find this useful, please ⭐ star this repository!**

---

**Made with ❤️ as a free alternative to commercial PDF tools**
