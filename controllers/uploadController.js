exports.uploadController= async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        })
    }

    const filePath = `/public/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        file: filePath,
    });
}