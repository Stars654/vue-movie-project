<template>
  <div class="movie-card" @click="handleClick">
    <div class="movie-poster">
      <img 
        :src="posterUrl" 
        :alt="movie.title"
        @error="handleImageError"
      />
      <div v-if="movie.avg_rating" class="movie-rating">
        <span class="rating-badge">
          ⭐ {{ movie.avg_rating.toFixed(1) }}
        </span>
      </div>
    </div>
    
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      
      <div class="movie-meta">
        <span class="movie-genre">{{ getFirstGenre(movie.genre) }}</span>
        <span class="movie-year">{{ getYear(movie.release_date) }}</span>
      </div>
      
      <div class="movie-stats">
        <span class="stat">
          <el-icon><View /></el-icon>
          {{ formatNumber(movie.view_count || 0) }}
        </span>
        <span class="stat">
          <el-icon><ChatDotRound /></el-icon>
          {{ formatNumber(movie.comment_count || 0) }}
        </span>
      </div>
      
      <div class="movie-author">
        推荐者: {{ movie.username }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['click'])

// 计算属性
const posterUrl = computed(() => {
  if (props.movie.poster_url) {
    return props.movie.poster_url.startsWith('http') 
      ? props.movie.poster_url 
      : `http://localhost:3000${props.movie.poster_url}`
  }
  return 'https://via.placeholder.com/300x450?text=暂无海报'
})

// 方法
const handleClick = () => {
  emits('click', props.movie.id)
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x450?text=图片加载失败'
}

const getFirstGenre = (genre) => {
  if (!genre) return '未知'
  return genre.split(',')[0].trim()
}

const getYear = (date) => {
  if (!date) return '未知'
  return date.slice(0, 4)
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num
}
</script>

<style scoped>
.movie-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
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
  text-align: center;
}

.rating-badge {
  background: #ff9900;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.movie-info {
  padding: 16px;
}

.movie-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
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

.movie-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  color: #666;
  font-size: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.movie-author {
  margin-top: auto;
  font-size: 12px;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 8px;
}
</style>