const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// 提交/更新评分 (POST /api/ratings/movie/:movieId)
router.post('/movie/:movieId', auth, ratingController.addOrUpdateRating);

// 获取用户评分 (GET /api/ratings/movie/:movieId/user)
router.get('/movie/:movieId/user', auth, ratingController.getUserRating);

module.exports = router;