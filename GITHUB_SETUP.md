# 🚀 How to Push to GitHub

Follow these steps to upload your PDF Compressor to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository settings:
   - **Name**: `pdf-compressor` (or any name you prefer)
   - **Description**: "Free unlimited PDF compression tool - no paywalls, no limits"
   - **Visibility**: Public (to show employers)
   - **DO NOT** initialize with README (we already have one)
4. Click **Create repository**

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add GitHub as remote origin (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/pdf-compressor.git

# Rename branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Step 3: Update README with Your GitHub Username

1. Open `README.md`
2. Find line 30: `git clone https://github.com/yourusername/pdf-compressor.git`
3. Replace `yourusername` with your actual GitHub username

## Step 4: Add a Screenshot (Optional but Recommended)

To make your README more impressive:

1. Take a screenshot of your app in action
2. Save it as `screenshot.png` in the project root
3. Update line 24 in README.md:
   ```markdown
   ![PDF Compressor Demo](screenshot.png)
   ```

## Step 5: Commit and Push Updates

```bash
git add README.md screenshot.png
git commit -m "Update README with GitHub username and screenshot"
git push
```

## 📝 For Your Resume/Portfolio

Add this to your resume or portfolio:

**Project**: PDF Compressor - Free Unlimited PDF Tool
**GitHub**: https://github.com/YOUR-USERNAME/pdf-compressor
**Tech Stack**: Node.js, Express, Ghostscript, JavaScript, HTML/CSS
**Key Features**:
- Built as free alternative to commercial tools with file size restrictions
- Batch processing with animated progress indicators
- Smart compression preserving quality
- Modern UI with glassmorphism and smooth animations

**Why I Built It**: Popular PDF tools like iLovePDF charge for files over 100 MB. I built this free, open-source alternative with no limits.

---

Your repository is ready! 🎉
