const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. 确保存储目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. 配置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 文件保存到 backend/uploads/
  },
  filename: function (req, file, cb) {
    // 解决中文文件名乱码，使用时间戳+随机数+扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 保留原始扩展名
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. 文件过滤器
const fileFilter = (req, file, cb) => {
  // 打印文件类型，方便调试
  console.log('正在上传文件:', file.originalname, '类型:', file.mimetype);
  
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型！仅支持图片和视频。'), false);
  }
};

// 4. 初始化 multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 限制 100MB
  },
  fileFilter: fileFilter
});

// 导出实例
module.exports = upload;