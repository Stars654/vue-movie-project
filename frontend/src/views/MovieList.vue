<template>
  <div class="movie-list-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">电影列表</h1>
        <p class="page-subtitle">发现、探索、分享好电影</p>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索电影名称、导演或主演"
            size="large"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch" type="primary" :icon="Search" />
            </template>
          </el-input>
        </div>

        <div class="filter-options">
          <div class="filter-group">
            <span class="filter-label">类型:</span>
            <el-select
              v-model="selectedGenre"
              placeholder="选择类型"
              clearable
              @change="handleFilterChange"
              style="width: 140px;"
            >
              <el-option label="全部" value="all" />
              <el-option
                v-for="genre in genres"
                :key="genre"
                :label="genre"
                :value="genre"
              />
            </el-select>
          </div>

          <div class="filter-group">
            <span class="filter-label">排序:</span>
            <el-select
              v-model="selectedSort"
              placeholder="排序方式"
              @change="handleSortChange"
              style="width: 140px;"
            >
              <el-option label="最新发布" value="newest" />
              <el-option label="评分最高" value="rating" />
              <el-option label="最多观看" value="views" />
            </el-select>
          </div>

          <div class="filter-group right-align">
            <el-button 
              type="primary" 
              @click="goToPublishPage" 
              :icon="VideoCamera"
            >
              推荐电影
            </el-button>
          </div>
        </div>
      </div>

      <!-- 电影列表 -->
      <div class="movie-list-section">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 将判断条件由 movies.length > 0 改为 processedMovies.length > 0 -->
        <div v-else-if="processedMovies.length > 0" class="movies-grid">
          <MovieCard
            v-for="movie in processedMovies"
            :key="movie.id"
            :movie="movie"
            @click="goToMovieDetail(movie.id)"
          />
        </div>

        <div v-else class="empty-state">
          <el-empty description="暂无电影数据">
            <template #description>
              <p>没有找到符合条件的电影</p>
              <p v-if="searchQuery || selectedGenre !== 'all' || selectedSort !== 'newest'">
                尝试调整搜索条件或
                <el-button type="text" @click="resetFilters">重置筛选</el-button>
              </p>
              <p v-else>
                成为第一个推荐电影的人吧！
                <el-button type="text" @click="goToPublishPage">立即推荐</el-button>
              </p>
            </template>
            <el-button type="primary" @click="resetFilters" v-if="searchQuery || selectedGenre !== 'all'">
              重置筛选
            </el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1 && !loading" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalItems"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MovieCard from '@/components/movie/MovieCard.vue'
import movieService from '@/services/movieService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const movies = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedGenre = ref('all')
const selectedSort = ref('newest')
const currentPage = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)

const genres = ref([
  '动作', '喜剧', '爱情', '科幻', '恐怖', '悬疑', '动画', '剧情',
  '冒险', '奇幻', '犯罪', '战争', '纪录片', '音乐', '家庭', '传记'
])

const isAuthenticated = computed(() => authStore.isAuthenticated)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))


// 处理后的电影列表：直接使用后端返回数据
const processedMovies = computed(() => {
  return movies.value
})

// 核心修复：同步 URL 参数到本地变量并请求数据
const syncParamsAndFetch = () => {
  // 从 URL query 中同步状态
  if (route.query.search !== undefined) {
    searchQuery.value = route.query.search
  }
  if (route.query.genre !== undefined) {
    selectedGenre.value = route.query.genre
  }
  fetchMovies()
}

// 监听本地输入变化
watch([searchQuery, selectedGenre, selectedSort], () => {
  currentPage.value = 1
  fetchMovies()
})

// 监听路由参数变化（解决首页跳转过来不刷新的问题）
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = newQuery.search || ''
    selectedGenre.value = newQuery.genre || 'all'
    fetchMovies()
  },
  { deep: true }
)

onMounted(() => {
  syncParamsAndFetch()
})

const fetchMovies = async () => {
  try {
    loading.value = true
    console.log('📡 开始获取电影列表...')
    console.log('📋 当前参数:', {
      page: currentPage.value,
      limit: pageSize.value,
      genre: selectedGenre.value,
      sort: selectedSort.value,
      search: searchQuery.value
    })

    let response
    
    // 如果有搜索关键词，使用搜索功能
    if (searchQuery.value.trim()) {
      console.log('🔍 执行搜索...')
      response = await movieService.searchMovies(searchQuery.value.trim(), {
        page: currentPage.value,
        limit: pageSize.value,
        genre: selectedGenre.value,
        sort: selectedSort.value
      })
    } else {
      // 没有搜索关键词，使用普通列表
      console.log('📄 执行普通列表查询...')
      response = await movieService.getMovies({
        page: currentPage.value,
        limit: pageSize.value,
        genre: selectedGenre.value,
        sort: selectedSort.value,
        search: '' // 明确传递空搜索
      })
    }

    console.log('✅ 获取电影响应:', response)

    if (response.success) {
      // 处理数据格式（适配不同后端返回格式）
      if (response.data && Array.isArray(response.data)) {
        movies.value = response.data
      } else if (response.data && response.data.movies) {
        movies.value = response.data.movies
      } else if (response.movies) {
        movies.value = response.movies
      } else {
        movies.value = []
      }
      
      // 处理分页信息
      if (response.pagination) {
        totalItems.value = response.pagination.total || 0
        pageSize.value = response.pagination.limit || pageSize.value
      } else if (response.total !== undefined) {
        totalItems.value = response.total
      } else if (response.data && response.data.total) {
        totalItems.value = response.data.total
      } else {
        totalItems.value = movies.value.length
      }
      
      // 获取电影类型列表（首次加载时）
      if (genres.value.length === 16) { // 如果还是默认的16个类型
        try {
          const typeResponse = await movieService.getMovieTypes()
          if (typeResponse.success && Array.isArray(typeResponse.data)) {
            genres.value = typeResponse.data
          }
        } catch (error) {
          console.warn('获取电影类型失败:', error)
        }
      }
      
      console.log(`🎬 成功加载 ${movies.value.length} 部电影，总计 ${totalItems.value} 部`)
    } else {
      ElMessage.error(response.error || '获取电影列表失败')
      movies.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('❌ 获取电影列表失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    ElMessage.error(error.response?.data?.error || '获取电影列表失败，请稍后重试')
    movies.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}
const handleSearch = () => {
  currentPage.value = 1
  fetchMovies()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchMovies()
}

const handleSortChange = () => {
  currentPage.value = 1
  fetchMovies()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchMovies()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchMovies()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedGenre.value = 'all'
  selectedSort.value = 'newest'
  currentPage.value = 1
  fetchMovies()
}

const goToPublishPage = () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录后再推荐电影')
    router.push('/login')
    return
  }
  router.push('/movie/publish')
}

const goToMovieDetail = (movieId) => {
  router.push(`/movie/${movieId}`)
}
// 测试搜索功能
const testSearchFunction = async () => {
  console.log('🧪 测试搜索功能...')
  
  const testCases = [
    { keyword: '复仇者', genre: 'all', sort: 'newest' },
    { keyword: '爱情', genre: '爱情', sort: 'rating' },
    { keyword: '', genre: '动作', sort: 'views' }
  ]
  
  for (const testCase of testCases) {
    console.log('测试用例:', testCase)
    
    try {
      const params = {
        page: 1,
        limit: 5,
        genre: testCase.genre,
        sort: testCase.sort,
        search: testCase.keyword
      }
      
      console.log('请求参数:', params)
      const response = await movieService.getMovies(params)
      console.log(`结果: ${testCase.keyword || '空搜索'} - 返回 ${response.data?.length || 0} 条记录`)
    } catch (error) {
      console.error(`测试失败 ${testCase.keyword}:`, error.message)
    }
  }
}

// 在组件挂载后运行测试
onMounted(() => {
  syncParamsAndFetch()
  
  // 调试模式：测试搜索功能
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      console.log('开始搜索功能测试...')
      testSearchFunction()
    }, 1000)
  }
})
</script>

<style scoped>
.movie-list-page {
  min-height: calc(100vh - 160px);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
}

.search-filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.search-box {
  margin-bottom: 20px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right-align {
  margin-left: auto;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .right-align {
    margin-left: 0;
  }
  
  .filter-group {
    justify-content: space-between;
  }
}

.movie-list-section {
  min-height: 400px;
}

.loading-state {
  padding: 40px 0;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>