const db = require('../config/database');

// 1. 获取电影列表 (保持不变，功能是好的)
exports.getMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || req.query.pageSize || '12');
        const sort = (req.query.sort || 'newest').trim();
        const genre = req.query.genre || '';
        const search = (req.query.search || req.query.q || req.query.keyword || '').trim();
        const offset = (page - 1) * limit;

        let whereConditions = ["1=1"]; 
        let queryParams = [];
        let countQueryParams = [];

        if (genre && genre !== 'all') {
            whereConditions.push("m.genre LIKE ?");
            queryParams.push(`%${genre}%`);
            countQueryParams.push(`%${genre}%`);
        }
        if (search && search.length > 0) {
            whereConditions.push("(m.title LIKE ? OR m.plot LIKE ? OR m.director LIKE ? OR m.starring LIKE ?)");
            const term = `%${search}%`;
            queryParams.push(term, term, term, term);
            countQueryParams.push(term, term, term, term);
        }

        const whereSQL = 'WHERE ' + whereConditions.join(' AND ');

        let orderBy = 'ORDER BY m.created_at DESC';
        if (sort === 'rating') orderBy = 'ORDER BY avg_rating DESC';
        if (sort === 'views') orderBy = 'ORDER BY m.view_count DESC';

        const query = `
            SELECT m.*, u.username, u.avatar,
                   COUNT(DISTINCT r.id) as rating_count,
                   AVG(r.rating) as avg_rating
            FROM movies m
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN ratings r ON m.id = r.movie_id
            ${whereSQL}
            GROUP BY m.id
            ${orderBy}
            LIMIT ? OFFSET ?
        `;

        console.log('Generated SQL Query:', query);
        console.log('Query Params:', [...queryParams, limit, offset]);
        const [movies] = await db.execute(query, [...queryParams, limit, offset]);
        console.log('Movies Query Result:', movies);

        console.log('Generated Count SQL Query:', `SELECT COUNT(*) as total FROM movies m ${whereSQL}`);
        console.log('Count Query Params:', countQueryParams);
        const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM movies m ${whereSQL}`, countQueryParams);
        console.log('Count Query Result:', countResult);
        
        const [genres] = await db.execute('SELECT DISTINCT genre FROM movies');
        const allGenres = [...new Set(genres.map(g => g.genre).join(',').split(',').map(s => s.trim()).filter(Boolean))].sort();

        res.json({
            success: true,
            data: movies,
            pagination: { 
                page: parseInt(page), 
                limit: parseInt(limit), 
                total: countResult[0].total, 
                totalPages: Math.ceil(countResult[0].total / limit) 
            },
            filters: { genres: allGenres }
        });
    } catch (error) {
        console.error('获取电影列表失败:', error);
        res.status(500).json({ success: false, error: '获取电影列表失败' });
    }
};

// 2. 获取热门电影 (保持不变)
exports.getTopMovies = async (req, res) => {
    try {
        const [movies] = await db.execute(`
            SELECT m.*, u.username, AVG(r.rating) as avg_rating
            FROM movies m
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN ratings r ON m.id = r.movie_id
            GROUP BY m.id
            ORDER BY avg_rating DESC, m.view_count DESC
            LIMIT 8
        `);
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: '获取热门电影失败' });
    }
};

// 3. 获取电影详情 (保持不变)
exports.getMovieById = async (req, res) => {
    try {
        const movieId = req.params.id;
        await db.execute('UPDATE movies SET view_count = view_count + 1 WHERE id = ?', [movieId]);

        const [movies] = await db.execute(`
            SELECT m.*, u.username, u.avatar,
                   AVG(r.rating) as avg_rating
            FROM movies m
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN ratings r ON m.id = r.movie_id
            WHERE m.id = ?
            GROUP BY m.id
        `, [movieId]);

        if (movies.length === 0) return res.status(404).json({ success: false, error: '电影不存在' });

        let userRating = null;
        if (req.user) {
            const [ratings] = await db.execute('SELECT rating FROM ratings WHERE user_id = ? AND movie_id = ?', [req.user.id, movieId]);
            userRating = ratings[0]?.rating || null;
        }

        res.json({ success: true, data: { ...movies[0], userRating } });
    } catch (error) {
        res.status(500).json({ success: false, error: '获取详情失败' });
    }
};

// 4. 创建电影 (核心修复：强制写入，不再回查)
exports.createMovie = async (req, res) => {
    try {
        console.log('--- 开始发布电影 ---');
        console.log('用户 ID:', req.user.id);
        console.log('请求体数据:', req.body);
        
        const { title, plot, genre, director, starring, release_date, video_url, poster_url, duration } = req.body;
        
        // 1. 简单验证
        if (!title || !plot || !genre) {
            console.error('参数缺失');
            return res.status(400).json({ success: false, error: '标题、剧情、类型为必填项' });
        }

        // 2. 准备 SQL
        // 注意：status 默认设为 'approved' 以便你能立即看到
        const sql = `
            INSERT INTO movies 
            (title, plot, genre, director, starring, release_date, video_url, poster_url, duration, user_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
        `;
        
        const params = [
            title, 
            plot, 
            genre, 
            director || null, 
            starring || null, 
            release_date || null, 
            video_url || null, 
            poster_url || null, 
            duration || null, 
            req.user.id
        ];

        console.log('执行 SQL:', sql);
        console.log('参数:', params);

        // 3. 执行插入
        const [result] = await db.execute(sql, params);

        console.log('插入成功, ID:', result.insertId);

        // 4. 直接返回成功，不再进行任何数据库操作
        res.status(201).json({ 
            success: true, 
            message: '发布成功', 
            data: { movieId: result.insertId } 
        });

    } catch (error) {
        console.error('发布失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '发布失败: ' + error.message,
            sqlMessage: error.sqlMessage 
        });
    }
};

// 5. 更新电影 (保持不变)
exports.updateMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        const [exists] = await db.execute('SELECT id FROM movies WHERE id = ? AND user_id = ?', [movieId, req.user.id]);
        
        if (exists.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: '无权修改此电影' });
        }

        const { title, plot, genre, director, starring, release_date, video_url, poster_url, duration } = req.body;
        
        await db.execute(
            `UPDATE movies SET title=?, plot=?, genre=?, director=?, starring=?, release_date=?, video_url=?, poster_url=?, duration=? WHERE id=?`,
            [title, plot, genre, director, starring, release_date, video_url, poster_url, duration, movieId]
        );

        res.json({ success: true, message: '更新成功' });
    } catch (error) {
        console.error('更新失败:', error);
        res.status(500).json({ success: false, error: '更新失败' });
    }
};

// 6. 删除电影 (保持不变)
exports.deleteMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        const [exists] = await db.execute('SELECT id FROM movies WHERE id = ? AND user_id = ?', [movieId, req.user.id]);
        
        if (exists.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: '无权删除此电影' });
        }
        
        await db.execute('DELETE FROM movies WHERE id = ?', [movieId]);
        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ success: false, error: '删除失败' });
    }
};

// 7. 获取用户自己的电影 (保持不变)
exports.getUserMovies = async (req, res) => {
    try {
        const [movies] = await db.execute(
            `SELECT * FROM movies WHERE user_id = ? ORDER BY created_at DESC`, 
            [req.user.id]
        );
        res.json({ success: true, data: movies });
    } catch (error) {
        console.error('获取用户电影失败:', error);
        res.status(500).json({ success: false, error: '获取用户电影失败' });
    }
};