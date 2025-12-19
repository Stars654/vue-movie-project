const path = require('path');
const fs = require('fs');

// 加载环境变量
const envPath = path.resolve(__dirname, '.env');
console.log('加载环境变量文件:', envPath);

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('环境变量加载成功');
} else {
    console.error('❌ .env 文件不存在:', envPath);
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
// const multer = require('multer'); // 移除：不再需要在入口文件中直接引入 multer

const app = express();
const PORT = process.env.PORT || 3001;

console.log('=== 配置信息 ===');
console.log('数据库主机:', process.env.DB_HOST);
console.log('数据库名称:', process.env.DB_NAME);
console.log('服务器端口:', PORT);
console.log('================');

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 关键：静态资源托管，让前端可以通过 http://localhost:3000/uploads/xxx.jpg 访问图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 测试数据库连接
const db = require('./config/database');

// --- 引入路由 ---
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // 引入独立的上传路由
const commentRoutes = require('./routes/commentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
// --- 注册路由 ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/upload', uploadRoutes); // 使用独立的上传路由模块
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

// 根路由测试
app.get('/', (req, res) => {
    res.json({ 
        message: '电影推荐系统后端API',
        status: '运行正常',
        timestamp: new Date().toISOString(),
        endpoints: {
            home: 'GET /',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            movies: 'GET /api/movies',
            upload: 'POST /api/upload'
        }
    });
});

// API测试路由
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API测试成功',
        data: { timestamp: new Date().toISOString() }
    });
});

// 数据库测试路由
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 as test');
        res.json({ 
            success: true, 
            message: '数据库连接正常',
            data: rows 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '数据库连接失败',
            error: error.message 
        });
    }
});

// 获取数据库表信息
app.get('/api/tables', async (req, res) => {
    try {
        const [tables] = await db.execute('SHOW TABLES');
        res.json({ 
            success: true, 
            tables: tables.map(t => t[Object.keys(t)[0]]),
            count: tables.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err.message);
    
    // 这里依然可以捕获路由中抛出的 multer 错误（如果有未被捕获的）
    if (err.name === 'MulterError') {
         return res.status(400).json({ 
            success: false,
            error: '文件上传错误: ' + err.message 
        });
    }
    
    res.status(500).json({ 
        success: false,
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: '接口不存在',
        requestedUrl: req.originalUrl
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 文件上传目录: ${uploadsDir}`);
    console.log(`🌐 前端地址: http://localhost:5173`);
    console.log(`📊 数据库: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});