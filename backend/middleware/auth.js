const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // 从请求头获取token
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: '访问被拒绝，请先登录'
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: '访问被拒绝，请先登录'
            });
        }
        
        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: '无效的令牌'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: '令牌已过期，请重新登录'
            });
        }
        
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
};

module.exports = auth;