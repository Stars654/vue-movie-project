import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 登录方法
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
        // 保存用户信息和token
        user.value = response.data.user
        token.value = response.data.token
        
        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '登录失败' 
      }
    }
  }

  // 注册方法
  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      if (response.success) {
        // 注册后自动登录
        user.value = response.data.user
        token.value = response.data.token
        
        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '注册失败' 
      }
    }
  }

  // 退出登录
  const logout = () => {
    authService.logout()
    user.value = null
    token.value = null
  }

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser()
      if (response.success) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      return response
    } catch (error) {
      logout()
      return { success: false, error: '获取用户信息失败' }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchCurrentUser
  }
})