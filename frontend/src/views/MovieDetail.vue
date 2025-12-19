<template>
  <div class="movie-detail-page" v-loading="loading">
    <div v-if="movie" class="container">
      
      <!-- 顶部：电影信息概览区 -->
      <div class="movie-hero">
        <el-row :gutter="40">
          <!-- 左侧：海报 -->
          <el-col :xs="24" :sm="8" :md="6">
            <div class="poster-wrapper">
              <img :src="getFileUrl(movie.poster_url)" :alt="movie.title" class="poster-img" />
            </div>
          </el-col>
          
          <!-- 右侧：详细信息 -->
          <el-col :xs="24" :sm="16" :md="18">
            <div class="movie-info">
              <h1 class="movie-title">
                {{ movie.title }}
                <span class="year" v-if="movie.release_date">({{ getYear(movie.release_date) }})</span>
              </h1>
              
              <div class="meta-row">
                <el-tag type="primary" effect="dark" class="genre-tag">{{ movie.genre }}</el-tag>
                <span class="meta-item" v-if="movie.duration">
                  <el-icon><Clock /></el-icon> {{ movie.duration }} 分钟
                </span>
                <span class="meta-item" v-if="movie.release_date">
                  <el-icon><Calendar /></el-icon> {{ formatDate(movie.release_date) }} 上映
                </span>
              </div>

              <!-- 评分展示与操作 -->
              <div class="rating-section">
                <div class="avg-rating">
                  <span class="big-score">{{ movie.avg_rating || '0.0' }}</span>
                  <span class="label">综合评分</span>
                </div>
                <div class="user-action" v-if="isAuthenticated">
                  <span class="label">我的评分:</span>
                  <el-rate 
                    v-model="userRating" 
                    allow-half 
                    show-score
                    @change="handleRate"
                    :disabled="isRatingSubmitting"
                  />
                </div>
              </div>

              <div class="crew-info">
                <p><strong>导演：</strong> {{ movie.director || '未知' }}</p>
                <p><strong>主演：</strong> {{ movie.starring || '暂无信息' }}</p>
              </div>

              <div class="plot-summary">
                <h3>剧情简介</h3>
                <p>{{ movie.plot }}</p>
              </div>
              
              <div class="action-buttons">
                <el-button type="primary" size="large" @click="scrollToVideo" v-if="movie.video_url">
                  <el-icon class="el-icon--left"><VideoPlay /></el-icon> 观看预告片
                </el-button>
                <el-button 
                  v-if="canEdit" 
                  type="warning" 
                  plain 
                  @click="goToEdit"
                >
                  <el-icon class="el-icon--left"><Edit /></el-icon> 编辑电影
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 中部：视频播放区 (如果有视频) -->
      <div v-if="movie.video_url" class="video-section" id="video-player">
        <h3 class="section-header">预告片 / 视频片段</h3>
        <div class="video-container">
          <video 
            controls 
            :src="getFileUrl(movie.video_url)" 
            class="video-player"
            :poster="getFileUrl(movie.poster_url)"
          >
            您的浏览器不支持视频播放。
          </video>
        </div>
      </div>

      <!-- 底部：评论区 -->
      <div class="comments-section">
        <h3 class="section-header">用户评论 ({{ comments.length }})</h3>
        
        <!-- 发表评论框 -->
        <div class="comment-input-area">
          <div v-if="isAuthenticated" class="input-wrapper">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下你的想法..."
              resize="none"
            />
            <div class="input-actions">
              <el-button type="primary" @click="submitComment" :loading="submittingComment">
                发表评论
              </el-button>
            </div>
          </div>
          <div v-else class="login-tip">
            <el-button type="primary" link @click="router.push('/login')">登录</el-button> 后参与评论
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list" v-loading="loadingComments">
          <div v-if="comments.length === 0" class="empty-comments">
            暂无评论，快来抢沙发吧！
          </div>
          
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <el-avatar :size="40" :src="getFileUrl(comment.avatar) || defaultAvatar">
                {{ comment.username ? comment.username.charAt(0).toUpperCase() : 'U' }}
              </el-avatar>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="username">{{ comment.username || '匿名用户' }}</span>
                <span class="time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="!loading && !movie" class="not-found">
      <el-empty description="未找到该电影信息">
        <el-button type="primary" @click="router.push('/movies')">返回列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Clock, Calendar, VideoPlay, Edit } from '@element-plus/icons-vue'
import movieService from '@/services/movieService'
import commentService from '@/services/commentService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const API_BASE_URL = 'http://localhost:3000'

// 状态
const loading = ref(true)
const movie = ref(null)
const userRating = ref(0)
const isRatingSubmitting = ref(false)

// 评论相关
const comments = ref([])
const loadingComments = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id)

// 判断当前用户是否是电影发布者或管理员，用于显示"编辑"按钮
const canEdit = computed(() => {
  if (!movie.value || !isAuthenticated.value) return false
  return authStore.isAdmin || movie.value.user_id === currentUserId.value
})

// 生命周期
onMounted(async () => {
  const movieId = route.params.id
  if (movieId) {
    await fetchMovieDetail(movieId)
    await fetchComments(movieId)
  }
})

// 获取电影详情
const fetchMovieDetail = async (id) => {
  try {
    loading.value = true
    const res = await movieService.getMovieById(id)
    if (res.success) {
      movie.value = res.data
      // 如果后端返回了当前用户的评分，设置到 userRating
      if (res.data.userRating) {
        userRating.value = Number(res.data.userRating)
      }
    } else {
      ElMessage.error(res.error || '获取详情失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const fetchComments = async (id) => {
  try {
    loadingComments.value = true
    const res = await commentService.getCommentsByMovieId(id)
    // 假设后端返回结构 { success: true, data: [...] }
    if (res.success) {
      comments.value = res.data
    }
  } catch (error) {
    console.error('获取评论失败', error)
  } finally {
    loadingComments.value = false
  }
}

// 提交评论
// 在 MovieDetail.vue 中找到 submitComment 方法
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    submittingComment.value = true
    const res = await commentService.createComment({
      movie_id: movie.value.id,
      content: newComment.value
    })
    
    if (res.success) {
      ElMessage.success('评论发表成功')
      newComment.value = ''
      await fetchComments(movie.value.id)
    } else {
      // 修改这里：显示具体的错误信息
      ElMessage.error(res.error || '评论失败') 
    }
  } catch (error) {
    console.error(error)
    // 修改这里：尝试获取后端返回的错误信息
    const errorMsg = error.response?.data?.error || '服务器错误'
    ElMessage.error(errorMsg)
  } finally {
    submittingComment.value = false
  }
}



// 评分处理
const handleRate = async (value) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录后评分')
    return
  }
  
  try {
    isRatingSubmitting.value = true
    const res = await commentService.submitRating({
      movie_id: movie.value.id,
      rating: value
    })
    
    if (res.success) {
      ElMessage.success('评分成功')
      // 可选：刷新详情以获取最新平均分
      // fetchMovieDetail(movie.value.id) 
    }
  } catch (error) {
    ElMessage.error('评分失败')
  } finally {
    isRatingSubmitting.value = false
  }
}

// 辅助函数
const getFileUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) return url
  return `${API_BASE_URL}${url}`
}

const getYear = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).getFullYear()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}

const scrollToVideo = () => {
  const element = document.getElementById('video-player')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToEdit = () => {
  router.push(`/movie/edit/${movie.value.id}`)
}
</script>

<style scoped>
.movie-detail-page {
  padding: 40px 0;
  min-height: 80vh;
  background-color: #f9f9f9;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 顶部信息区 */
.movie-hero {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.poster-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  aspect-ratio: 2/3;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
  line-height: 1.2;
}

.year {
  font-weight: 400;
  color: #888;
  font-size: 1.8rem;
  margin-left: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

/* 评分区域 */
.rating-section {
  display: flex;
  align-items: center;
  gap: 40px;
  background: #f8faff;
  padding: 15px 25px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.avg-rating {
  text-align: center;
}

.big-score {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #ff9900;
  line-height: 1;
}

.avg-rating .label {
  font-size: 12px;
  color: #999;
}

.user-action {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.crew-info {
  font-size: 16px;
  color: #444;
  margin-bottom: 25px;
  line-height: 1.6;
}

.plot-summary h3 {
  font-size: 18px;
  margin-bottom: 10px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.plot-summary p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  gap: 15px;
}

/* 视频区域 */
.video-section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.section-header {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 5px solid #409eff;
}

.video-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: black;
  aspect-ratio: 16/9;
}

.video-player {
  width: 100%;
  height: 100%;
}

/* 评论区域 */
.comments-section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.comment-input-area {
  margin-bottom: 30px;
}

.input-actions {
  margin-top: 10px;
  text-align: right;
}

.login-tip {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.text {
  color: #555;
  line-height: 1.5;
}

.empty-comments {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 768px) {
  .movie-hero {
    padding: 20px;
  }
  
  .poster-wrapper {
    max-width: 200px;
    margin: 0 auto 20px;
  }
  
  .movie-title {
    font-size: 1.8rem;
    text-align: center;
  }
  
  .movie-info {
    text-align: center;
  }
  
  .meta-row {
    justify-content: center;
  }
  
  .rating-section {
    justify-content: center;
  }

  .crew-info {
    text-align: left;
  }
  
  .plot-summary {
    text-align: left;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>