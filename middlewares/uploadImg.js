const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/images"))
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.filename}`)
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb({
            message: 'Only image files are allowed!'
        }, false)
    }
}


const uploadImg = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
})

const productImgResize = async (req, res, next) => {
    if (!req.files)
        return next();
    await Promise.all(
        req.files.map(async (file) => {
            await sharp(file.path).resize(300, 300).
                toFormat("jpeg").
                jpeg({quality: 90}).
                toFile(`public/images/products/${file.filename}`)
        })
    )
    next();
}

const blogImgResize = async (req, res, next) => {
    if (!req.files)
        return next();
    await Promise.all(
        req.files.map(async (file) => {
            await sharp(file.path).resize(300, 300).
                toFormat("jpeg").
                jpeg({quality: 90}).
                toFile(`public/images/blogs/${file.filename}`)
        })
    )
    next();
}

module.exports = { uploadImg, productImgResize, blogImgResize };