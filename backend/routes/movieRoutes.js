const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

// --- 调试检查：确保控制器方法都已定义 ---
const checkMethod = (methodName) => {
    if (typeof movieController[methodName] !== 'function') {
        console.error(`[Fatal Error] movieController.${methodName} is undefined or not a function.`);
        console.error('请检查 backend/controllers/movieController.js 是否正确导出了该方法。');
        // 临时提供一个空函数防止崩溃，但请求会失败
        movieController[methodName] = (req, res) => res.status(500).json({ error: `Method ${methodName} not implemented` });
    }
};

['getMovies', 'getTopMovies', 'getMovieById', 'createMovie', 'getUserMovies', 'updateMovie', 'deleteMovie'].forEach(checkMethod);

// --- 路由定义 ---

// 公开接口
router.get('/', movieController.getMovies);
router.get('/top', movieController.getTopMovies); // 注意：/top 必须在 /:id 之前
router.get('/:id', movieController.getMovieById);

// 需要登录的接口
router.post('/', auth, movieController.createMovie);
router.get('/user/movies', auth, movieController.getUserMovies); // 获取用户发布的电影
router.put('/:id', auth, movieController.updateMovie);
router.delete('/:id', auth, movieController.deleteMovie);

module.exports = router;