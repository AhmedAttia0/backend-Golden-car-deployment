import multer from "multer";

// نخزن الملفات مؤقتًا في الذاكرة بدل الهارد
const storage = multer.memoryStorage();

// فلتر للتأكد إن الملفات صور فقط
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("جميع الملفات يجب أن تكون صور"), false);
  }
};

// إعدادات Multer
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB لكل صورة
});
