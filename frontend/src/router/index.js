import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 页面组件
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const MovieList = () => import('@/views/MovieList.vue')
const MovieDetail = () => import('@/views/MovieDetail.vue')
const UserProfile = () => import('@/views/UserProfile.vue')
const AdminPanel = () => import('@/views/AdminPanel.vue')

// 关键修复：正确引入发布组件，不要注释掉
const MoviePublish = () => import('@/views/MoviePublish.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: '注册', requiresGuest: true }
  },
  
  // 电影列表页
  {
    path: '/movies',
    name: 'movies',
    component: MovieList,
    meta: { title: '电影列表' }
  },
  
  // 发布电影页 (注意：这个路由定义必须在 /movie/:id 之前，否则 'publish' 会被当成 ID)
  {
    path: '/movie/publish',
    name: 'movie-publish',
    component: MoviePublish,
    meta: { title: '发布电影', requiresAuth: true }
  },
  
  // 编辑电影页
  {
    path: '/movie/edit/:id',
    name: 'movie-edit',
    component: MoviePublish,
    meta: { title: '编辑电影', requiresAuth: true }
  },
  
  // 电影详情页
  {
    path: '/movie/:id',
    name: 'movie-detail',
    component: MovieDetail,
    meta: { title: '电影详情' }
  },
  
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPanel,
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true }
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 电影推荐系统` : '电影推荐系统'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 检查是否需要游客状态
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }
  
  next()
})

export default router