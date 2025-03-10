const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const blogMulterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get blog slug from request body (must be provided)
        const slug = req.body.slug;
        if (!slug) {
            return cb(new Error("Blog slug is required before uploading images."), false);
        }
        const uploadPath = path.join(__dirname, "../public/images/blog", slug);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const productMulterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get product slug from request body (must be provided)
        const slug = req.body.slug;
        if (!slug) {
            return cb(new Error("Product slug is required before uploading images."), false);
        }
        const uploadPath = path.join(__dirname, "../public/images/product", slug);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Optionally, sanitize file.originalname here.
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb({ message: 'Only image files are allowed!' }, false);
    }
};

const uploadProductImg = multer({
    storage: productMulterStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

const uploadBlogImg = multer({
    storage: blogMulterStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});


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

module.exports = { uploadProductImg, uploadBlogImg, productImgResize, blogImgResize };