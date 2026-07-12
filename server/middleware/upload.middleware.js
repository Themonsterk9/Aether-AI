const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadDirectory);

    },

    filename(req, file, cb) {

        const cleanName = path.basename(file.originalname).replace(/\s+/g, "_");
        const uniqueName = Date.now() + "-" + cleanName;

        cb(null, uniqueName);

    }

});

const allowedMimeTypes = [
    "text/plain",
    "text/markdown",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const fileFilter = (req, file, cb) => {

    if (allowedMimeTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error("Unsupported file type."),
            false
        );

    }

};

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 20 * 1024 * 1024
    }

});

module.exports = (req, res, next) => {

    upload.single("document")(req, res, (err) => {

        if (err) {

            return res.status(400).json({
                success: false,
                message: err.message || "Unsupported file type."
            });

        }

        next();

    });

};