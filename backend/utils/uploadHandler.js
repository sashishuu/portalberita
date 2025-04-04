const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

const handleUpload = (folder) => (req, res, next) => {
  const form = formidable({
    multiples: false,
    uploadDir: path.join(uploadDir, folder),
    keepExtensions: true,
    filename: (_, file) => {
      const ext = path.extname(file.originalFilename);
      const name = Date.now() + '_' + file.newFilename + ext;
      return name;
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Upload failed' });
    req.body = fields;
    req.file = files.image || null;
    next();
  });
};

module.exports = handleUpload;
