const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image optimization

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const directories = [
    'uploads',
    'uploads/articles',
    'uploads/users',
    'uploads/temp'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Optimize image
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;
    
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // Delete original if different from output
    if (inputPath !== outputPath) {
      deleteFile(inputPath);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
};

// Generate thumbnail
const generateThumbnail = async (inputPath, outputPath, size = 200) => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw error;
  }
};

// Get file info
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: ext,
      mimeType: getMimeType(ext),
      exists: true
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

// Get MIME type from extension
const getMimeType = (extension) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// Clean up old files (cleanup job)
const cleanupOldFiles = async (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    if (!fs.existsSync(directory)) {
      return;
    }
    
    const files = fs.readdirSync(directory);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        deleteFile(filePath);
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old files from ${directory}`);
    return deletedCount;
  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
};

// Validate file type
const validateFileType = (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return allowedTypes.includes(ext);
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  
  return `${name}-${timestamp}-${random}${ext}`;
};

// Process uploaded file
const processUploadedFile = async (file, options = {}) => {
  try {
    const {
      optimize = true,
      generateThumb = false,
      maxWidth = 1200,
      maxHeight = 800,
      quality = 85
    } = options;
    
    let processedPath = file.path;
    
    // Optimize image if requested
    if (optimize && validateFileType(file.filename)) {
      const optimizedPath = file.path.replace(/\.[^/.]+$/, `-optimized${path.extname(file.path)}`);
      
      processedPath = await optimizeImage(file.path, optimizedPath, {
        width: maxWidth,
        height: maxHeight,
        quality
      });
    }
    
    // Generate thumbnail if requested
    let thumbnailPath = null;
    if (generateThumb && validateFileType(file.filename)) {
      thumbnailPath = processedPath.replace(/\.[^/.]+$/, `-thumb${path.extname(processedPath)}`);
      await generateThumbnail(processedPath, thumbnailPath);
    }
    
    return {
      original: file.path,
      processed: processedPath,
      thumbnail: thumbnailPath,
      info: getFileInfo(processedPath)
    };
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};

module.exports = {
  ensureUploadDirectories,
  deleteFile,
  optimizeImage,
  generateThumbnail,
  getFileInfo,
  getMimeType,
  cleanupOldFiles,
  validateFileType,
  generateUniqueFilename,
  processUploadedFile
};