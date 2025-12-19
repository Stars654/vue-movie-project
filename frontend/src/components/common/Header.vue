<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          🎬 <span class="logo-text">电影推荐系统</span>
        </router-link>
      </div>
      
      <nav class="nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        <router-link to="/movies" class="nav-item" :class="{ active: $route.path.startsWith('/movies') }">
          <el-icon><VideoCamera /></el-icon>
          电影列表
        </router-link>
        
        <!-- 新增：发布电影入口 -->
        <router-link 
          v-if="isAuthenticated" 
          to="/movie/publish" 
          class="nav-item" 
          :class="{ active: $route.path === '/movie/publish' }"
        >
          <el-icon><Plus /></el-icon>
          发布电影
        </router-link>
        
        <div v-if="isAuthenticated" class="user-menu">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="user.avatar">
                {{ user.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ user.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="my-movies">
                  <el-icon><Collection /></el-icon>
                  我的推荐
                </el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" command="admin">
                  <el-icon><Setting /></el-icon>
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div v-else class="auth-buttons">
          <router-link to="/login" class="login-btn">
            登录
          </router-link>
          <router-link to="/register" class="register-btn">
            注册
          </router-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeFilled,
  VideoCamera,
  User,
  Collection,
  Setting,
  SwitchButton,
  Plus // 引入 Plus 图标
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user || {})
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'my-movies':
      router.push('/profile?tab=movies')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 1.2rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #409eff;
  background-color: #f0f9ff;
}

.user-menu {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 0.9rem;
  color: #303133;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.login-btn,
.register-btn {
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.login-btn {
  color: #409eff;
  border: 1px solid #409eff;
}

.login-btn:hover {
  background-color: #f0f9ff;
}

.register-btn {
  background: #409eff;
  color: white;
  border: 1px solid #409eff;
}

.register-btn:hover {
  background: #66b1ff;
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .logo-text {
    display: none;
  }
  
  .nav {
    gap: 12px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .login-btn,
  .register-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
</style>