const express = require('express');
const router = express.Router();
// 引入刚刚修复的中间件
const upload = require('../middleware/upload');

// 接口地址: POST /api/upload
// upload.single('file') 这里的 'file' 必须和前端 FormData 的 key 一致
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    // 生成访问 URL
    // 注意：这里返回的是相对路径，前端通常需要拼接后端地址 (http://localhost:3000)
    // 或者你可以直接返回完整 URL: `http://${req.headers.host}/uploads/${req.file.filename}`
    const fileUrl = `/uploads/${req.file.filename}`;

    console.log('文件上传成功:', fileUrl);

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: fileUrl, 
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('上传路由出错:', error);
    res.status(500).json({ success: false, error: '文件上传失败: ' + error.message });
  }
});

module.exports = router;