const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

// 确保先加载环境变量
const envPath = path.resolve(__dirname, '../.env');
console.log('加载环境变量文件:', envPath);

// 检查.env文件是否存在
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('环境变量加载成功');
} else {
    console.error('❌ .env 文件不存在:', envPath);
    console.log('当前工作目录:', process.cwd());
    console.log('正在创建示例.env文件...');
    
    // 创建示例.env文件
    const exampleEnv = `# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=192.168.75.139
DB_USER=root
DB_PASSWORD=123456
DB_NAME=movie_recommendation

# JWT配置
JWT_SECRET=movie_recommendation_jwt_secret_2023
JWT_EXPIRE=7d

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800`;
    
    fs.writeFileSync(envPath, exampleEnv);
    console.log('✅ 已创建示例.env文件');
    require('dotenv').config({ path: envPath });
}

console.log('数据库配置信息:');
console.log('主机:', process.env.DB_HOST);
console.log('用户:', process.env.DB_USER);
console.log('数据库:', process.env.DB_NAME);
console.log('端口:', process.env.DB_PORT || 3306);

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_recommendation',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    debug: process.env.NODE_ENV === 'development'
});

// 使用Promise包装
const promisePool = pool.promise();

module.exports = promisePool;