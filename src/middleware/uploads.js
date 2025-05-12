const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader({
  folder,
  allowedTypes = [],
  maxSize = 5 * 1024 * 1024,
}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `public/uploads/${folder}`;
      req.uploadFolder = folder;
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      console.log(`Generated filename: ${uniqueName}`);
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    console.log(
      `Checking file: ${file.originalname}, MIME type: ${file.mimetype}`
    );
    console.log(`Allowed types: ${allowedTypes.join(", ")}`);

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      const err = new Error(`Type de fichier non autorisé: ${file.mimetype}`);
      err.code = "LIMIT_FILE_TYPE";
      return cb(err, false);
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });

  // Ce wrapper capture les erreurs et les renvoie proprement en JSON
  return {
    single: (fieldName) => (req, res, next) => {
      console.log(
        `[DEBUG] upload middleware triggered for field: ${fieldName}`
      );
      console.log(`Content-Type of request: ${req.headers["content-type"]}`);

      // Vérifiez si le champ existe dans le formulaire
      upload.single(fieldName)(req, res, function (err) {
        console.log(
          `[DEBUG] Multer processing completed for field: ${fieldName}`
        );

        if (err) {
          console.error(`[ERROR] Upload error: ${err.message}`);
          if (
            err.code === "LIMIT_FILE_TYPE" ||
            err instanceof multer.MulterError
          ) {
            return res.status(400).json({ error: err.message });
          }
          return res.status(500).json({ error: "Erreur de téléchargement." });
        }

        // Vérifiez si un fichier a été uploadé
        if (req.file) {
          console.log(
            `[SUCCESS] File uploaded: ${req.file.originalname} -> ${req.file.filename}`
          );
        } else {
          console.log(`[INFO] No file was provided for field: ${fieldName}`);
        }

        next();
      });
    },
  };
}

module.exports = createUploader;
