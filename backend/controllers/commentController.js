const db = require('../config/database');

// 获取电影的评论
exports.getMovieComments = async (req, res) => {
    try {
        const movieId = req.params.movieId;
        
        const [comments] = await db.execute(`
            SELECT c.*, u.username, u.avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.movie_id = ? AND c.parent_id IS NULL
            ORDER BY c.created_at DESC
        `, [movieId]);
        
        // 获取回复
        for (const comment of comments) {
            const [replies] = await db.execute(`
                SELECT c.*, u.username, u.avatar
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.parent_id = ?
                ORDER BY c.created_at ASC
            `, [comment.id]);
            comment.replies = replies;
        }
        
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({
            success: false,
            error: '获取评论失败'
        });
    }
};

// 添加评论
exports.addComment = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { content, parentId } = req.body;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能为空'
            });
        }
        
        const [result] = await db.execute(
            'INSERT INTO comments (user_id, movie_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [req.user.id, movieId, content.trim(), parentId || null]
        );
        
        // 获取完整的评论信息
        const [comments] = await db.execute(`
            SELECT c.*, u.username, u.avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: '评论成功',
            data: comments[0]
        });
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({
            success: false,
            error: '添加评论失败'
        });
    }
};

// 删除评论
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // 检查评论是否存在且属于当前用户
        const [comments] = await db.execute(
            'SELECT * FROM comments WHERE id = ? AND user_id = ?',
            [commentId, req.user.id]
        );
        
        if (comments.length === 0) {
            return res.status(403).json({
                success: false,
                error: '无权删除此评论'
            });
        }
        
        await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
        
        res.json({
            success: true,
            message: '评论删除成功'
        });
    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({
            success: false,
            error: '删除评论失败'
        });
    }
};