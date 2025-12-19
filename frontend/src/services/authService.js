import api from './api'

// 用户注册
async function register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
}

// 用户登录
async function login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
}

// 获取当前用户信息
async function getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
}

// 退出登录
function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

// 检查是否已登录
function isAuthenticated() {
    return !!localStorage.getItem('token')
}

// 获取用户信息
function getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
}

// 默认导出
export default {
    register,
    login,
    getCurrentUser,
    logout,
    isAuthenticated,
    getUser
}