const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
// 注意：根据你的项目结构，中间件通常是 middleware/auth.js
const auth = require('../middleware/auth'); 

// 获取电影评论 - GET /api/comments/movie/:movieId
// 公开接口，通常不需要 auth，除非你想标记当前用户点赞过的评论
router.get('/movie/:movieId', commentController.getMovieComments);

// 添加评论 - POST /api/comments/movie/:movieId
// 需要登录，使用 auth 中间件
router.post('/movie/:movieId', auth, commentController.addComment);

// 删除评论 - DELETE /api/comments/:commentId
// 需要登录，使用 auth 中间件
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router;