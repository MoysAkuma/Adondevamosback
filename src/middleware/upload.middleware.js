import multer from 'multer';

/**
 * Multer configuration for handling file uploads
 * Stores files in memory as buffers for processing
 */
const storage = multer.memoryStorage();

/**
 * File filter to accept only images
 */
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

/**
 * Multer instance for single file upload
 * Max file size: 5MB
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * Optional file upload middleware
 * Accepts multipart/form-data with optional 'file' field
 * If no file is uploaded, continues to next middleware
 */
export const optionalSingleUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      // If error is because no file was uploaded, that's OK - continue
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size must be less than 5MB'
          });
        }
        // For other multer errors, if it's just missing file, continue
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next();
        }
      } else if (err) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      }
      
      // File uploaded successfully or no file - both are OK
      next();
    });
  };
};

/**
 * Required file upload middleware
 * Requires multipart/form-data with 'file' field
 */
export const requireSingleUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size must be less than 5MB'
          });
        }
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload an image file'
        });
      }
      
      next();
    });
  };
};

export default upload;
