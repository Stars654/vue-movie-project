const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: '请提供用户名、邮箱和密码'
            });
        }
        
        // 检查用户名是否已存在
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                error: '用户名或邮箱已被注册'
            });
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        // 生成JWT令牌
        const token = jwt.sign(
            { 
                id: result.insertId, 
                username, 
                email, 
                role: 'user' 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        
        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                user: {
                    id: result.insertId,
                    username,
                    email,
                    role: 'user'
                },
                token
            }
        });
        
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            error: '注册失败，请稍后重试'
        });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: '请提供用户名和密码'
            });
        }
        
        // 查找用户
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: '用户名或密码错误'
            });
        }
        
        const user = users[0];
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: '用户名或密码错误'
            });
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        
        // 移除密码字段
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: userWithoutPassword,
                token
            }
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            error: '登录失败，请稍后重试'
        });
    }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
        
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            error: '获取用户信息失败'
        });
    }
};