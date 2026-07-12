import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },

    filename(req, file, cb) {
        cb(
            null,
            `${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const imageTypes = /jpg|jpeg|png|webp/;
    const documentTypes = /pdf|doc|docx/;

    const ext = path.extname(file.originalname).toLowerCase();

    if (
        imageTypes.test(ext) ||
        documentTypes.test(ext)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"));
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;