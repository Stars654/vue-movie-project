<template>
  <div class="home">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="container">
        <h1 class="welcome-title">发现好电影</h1>
        <p class="welcome-subtitle">探索、评价、分享你喜爱的电影</p>
        
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索电影名称、导演或主演"
            size="large"
            @keyup.enter="searchMovies"
          >
            <template #append>
              <el-button @click="searchMovies" type="primary" :icon="Search" />
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 热门推荐 -->
    <section class="section top-movies">
      <div class="container">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          热门推荐
        </h2>
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>
        <div v-else-if="topMovies.length > 0" class="movies-grid">
          <div 
            v-for="movie in topMovies" 
            :key="movie.id"
            class="movie-card"
            @click="goToDetail(movie.id)"
          >
            <div class="movie-poster">
              <!-- 修复：使用 getFileUrl 处理图片路径 -->
              <img :src="getFileUrl(movie.poster_url) || 'https://via.placeholder.com/300x450?text=暂无海报'" :alt="movie.title" />
              <div class="movie-rating">
                <el-rate
                  v-model="movie.avg_rating"
                  disabled
                  :max="5"
                  :allow-half="true"
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </div>
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-meta">
                <!-- 修复：genre 可能是 null -->
                <span class="movie-genre">{{ movie.genre ? movie.genre.split(/[,，]/)[0] : '未知类型' }}</span>
                <span class="movie-year">{{ movie.release_date ? movie.release_date.slice(0, 4) : '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无热门电影" />
      </div>
    </section>

    <!-- 最新电影 -->
    <section class="section latest-movies">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><VideoCamera /></el-icon>
            最新电影
          </h2>
          <!-- 这里会跳转到电影列表 -->
          <router-link to="/movies" class="view-all">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>
        <div v-else-if="latestMovies.length > 0" class="movies-grid">
          <div 
            v-for="movie in latestMovies" 
            :key="movie.id"
            class="movie-card"
            @click="goToDetail(movie.id)"
          >
            <div class="movie-poster">
              <!-- 修复：使用 getFileUrl 处理图片路径 -->
              <img :src="getFileUrl(movie.poster_url) || 'https://via.placeholder.com/300x450?text=暂无海报'" :alt="movie.title" />
              <div class="movie-rating">
                <el-rate
                  v-model="movie.avg_rating"
                  disabled
                  :max="5"
                  :allow-half="true"
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </div>
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-meta">
                <span class="movie-genre">{{ movie.genre ? movie.genre.split(/[,，]/)[0] : '未知类型' }}</span>
                <span class="movie-year">{{ movie.release_date ? movie.release_date.slice(0, 4) : '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无电影数据" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Star, VideoCamera, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import movieService from '@/services/movieService'

const router = useRouter()

const searchQuery = ref('')
const topMovies = ref([])
const latestMovies = ref([])
const loading = ref(true)

// 必须与后端地址一致
const API_BASE_URL = 'http://localhost:3000'

// 辅助函数：处理图片路径
const getFileUrl = (url) => {
  if (!url) return ''
  // 1. 如果是网络图片 (http/https) 或本地预览 (blob)，直接返回
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
    return url
  }
  // 2. 兼容 Windows 路径符，并确保以 / 开头
  let cleanUrl = url.replace(/\\/g, '/')
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl
  }
  // 3. 拼接后端地址
  return `${API_BASE_URL}${cleanUrl}`
}

onMounted(async () => {
  await fetchMovies()
})

const fetchMovies = async () => {
  try {
    loading.value = true
    
    // 获取热门电影
    const topResponse = await movieService.getTopMovies()
    if (topResponse.success) {
      // 确保评分是数字，避免el-rate报错
      topMovies.value = topResponse.data.slice(0, 4).map(m => ({
        ...m,
        avg_rating: Number(m.avg_rating)
      }))
    }
    
    // 获取最新电影
    const latestResponse = await movieService.getMovies({ 
      limit: 8,
      sort: 'newest'
    })
    if (latestResponse.success) {
      latestMovies.value = latestResponse.data.map(m => ({
        ...m,
        avg_rating: Number(m.avg_rating)
      }))
    }
  } catch (error) {
    console.error('获取电影失败:', error)
    // ElMessage.error('加载电影数据失败') // 避免首页一加载就弹窗
  } finally {
    loading.value = false
  }
}

const searchMovies = () => {
  if (searchQuery.value.trim()) {
    // 跳转到电影列表页，并带上搜索参数
    router.push({ 
      path: '/movies', // 确保这个路径对应的是 MovieList 组件
      query: { search: searchQuery.value.trim() }
    })
  }
}

const goToDetail = (movieId) => {
  router.push(`/movie/${movieId}`)
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 160px);
}

.search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.welcome-subtitle {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.section {
  padding: 40px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.8rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-all {
  color: #409eff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}

.view-all:hover {
  color: #66b1ff;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.movie-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background-color: #f0f0f0;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-rating {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px 12px 8px;
}

.movie-info {
  padding: 16px;
}

.movie-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.movie-genre {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.movie-year {
  color: #999;
  font-size: 12px;
}

.loading {
  padding: 40px 0;
}

.top-movies {
  background: #f9fafb;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}
</style>