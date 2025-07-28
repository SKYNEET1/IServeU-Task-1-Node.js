const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cd) {
        const extension = path.extname(file.originalname); // get file extension from the original file name
        const name = path.basename(file.originalname); // get file name from the original file name Without extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, name + '-' + uniqueSuffix + extension)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 },
});

module.exports = upload