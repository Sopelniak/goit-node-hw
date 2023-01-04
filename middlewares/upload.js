const path = require('path');
const multer = require('multer');

const tempDir = path.join(__dirname, '../', 'temp');

const multerConfig = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
        // указывается, если нужно переименовать файл
        cb(null, file.originalname); // file.originalname - новое имя файла
    },
});

const upload = multer({
    storage: multerConfig,
});

module.exports = upload;
