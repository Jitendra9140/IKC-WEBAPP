const { cloudinary } = require('../config/cloudinary');

const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Debug: Log the full Cloudinary response
    console.log('Uploaded to Cloudinary:', req.file);

    // Send Cloudinary URL
    const imageUrl = req.file.path || req.file.secure_url;
    console.log('Image URL:', imageUrl);

    res.status(200).json({
      message: 'File uploaded successfully',
      imageUrl: imageUrl, // full https://res.cloudinary.com/... URL
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
};
