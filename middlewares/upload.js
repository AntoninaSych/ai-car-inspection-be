// middlewares/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "../temp");
await createDirIfNotExist(tempDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

export default multer({ storage });
