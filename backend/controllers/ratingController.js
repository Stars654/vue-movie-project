const db = require('../config/database');

// 添加或更新评分
exports.addOrUpdateRating = async (req, res) => {
    try {
        const { movieId } = req.params; // 对应路由 /movie/:movieId
        const { rating } = req.body;
        
        if (!rating || rating < 0 || rating > 5) {
            return res.status(400).json({ success: false, error: '评分必须在0到5之间' });
        }
        
        const [existingRatings] = await db.execute(
            'SELECT * FROM ratings WHERE user_id = ? AND movie_id = ?',
            [req.user.id, movieId]
        );
        
        if (existingRatings.length > 0) {
            await db.execute(
                'UPDATE ratings SET rating = ? WHERE user_id = ? AND movie_id = ?',
                [rating, req.user.id, movieId]
            );
        } else {
            await db.execute(
                'INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?)',
                [req.user.id, movieId, rating]
            );
        }
        
        const [avgResult] = await db.execute(
            'SELECT AVG(rating) as avg_rating FROM ratings WHERE movie_id = ?',
            [movieId]
        );
        
        await db.execute(
            'UPDATE movies SET avg_rating = ? WHERE id = ?',
            [avgResult[0].avg_rating || 0, movieId]
        );
        
        res.json({
            success: true,
            message: existingRatings.length > 0 ? '评分更新成功' : '评分成功',
            data: { rating, avg_rating: avgResult[0].avg_rating }
        });
    } catch (error) {
        console.error('评分失败:', error);
        res.status(500).json({ success: false, error: '评分失败' });
    }
};

// 获取用户评分
exports.getUserRating = async (req, res) => {
    try {
        const { movieId } = req.params;
        const [ratings] = await db.execute(
            'SELECT rating FROM ratings WHERE user_id = ? AND movie_id = ?',
            [req.user.id, movieId]
        );
        res.json({ success: true, data: ratings[0] || null });
    } catch (error) {
        console.error('获取用户评分失败:', error);
        res.status(500).json({ success: false, error: '获取用户评分失败' });
    }
};