<template>
  <div class="publish-movie-page">
    <div class="container">
      <div class="form-card">
        <div class="form-header">
          <h2>{{ isEditMode ? '编辑电影' : '发布新电影' }}</h2>
          <p>分享你喜爱的电影给更多人</p>
        </div>

        <el-form 
          ref="movieFormRef"
          :model="movieForm"
          :rules="rules"
          label-width="100px"
          label-position="top"
          size="large"
          v-loading="submitting"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电影名称" prop="title">
                  <el-input v-model="movieForm.title" placeholder="请输入电影名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电影类型" prop="genre">
                  <el-select 
                    v-model="movieForm.genre" 
                    placeholder="请选择类型" 
                    allow-create 
                    filterable 
                    style="width: 100%"
                  >
                    <el-option v-for="item in genreOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="导演" prop="director">
                  <el-input v-model="movieForm.director" placeholder="请输入导演姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主演" prop="starring">
                  <el-input v-model="movieForm.starring" placeholder="请输入主要演员，用逗号分隔" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="上映时间" prop="release_date">
                  <el-date-picker
                    v-model="movieForm.release_date"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="时长 (分钟)" prop="duration">
                  <el-input-number v-model="movieForm.duration" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 剧情简介 -->
          <div class="form-section">
            <h3 class="section-title">剧情简介</h3>
            <el-form-item prop="plot">
              <el-input 
                v-model="movieForm.plot" 
                type="textarea" 
                :rows="6" 
                placeholder="请输入电影的故事情节介绍..." 
              />
            </el-form-item>
          </div>

          <!-- 媒体资源 -->
          <div class="form-section">
            <h3 class="section-title">媒体资源</h3>
            
            <!-- 海报上传 -->
            <el-form-item label="电影海报" prop="poster_url">
              <el-input v-model="movieForm.poster_url" placeholder="输入图片链接或点击上传">
                <template #append>
                  <el-button 
                    :icon="Picture" 
                    :loading="uploadingPoster"
                    @click="triggerPosterUpload"
                  >
                    {{ uploadingPoster ? '上传中...' : '上传海报' }}
                  </el-button>
                </template>
              </el-input>
              <!-- 隐藏的文件输入框 -->
              <input 
                type="file" 
                ref="posterInputRef" 
                style="display: none" 
                accept="image/*" 
                @change="handlePosterChange"
              >
              <!-- 修复：使用 getFileUrl 处理预览路径 -->
              <div v-if="movieForm.poster_url" class="preview-image">
                <img :src="getFileUrl(movieForm.poster_url)" alt="海报预览" />
              </div>
            </el-form-item>

            <!-- 视频上传 -->
            <el-form-item label="预告片/视频" prop="video_url">
              <el-input v-model="movieForm.video_url" placeholder="输入视频链接或点击上传">
                <template #append>
                  <el-button 
                    :icon="VideoCamera" 
                    :loading="uploadingVideo"
                    @click="triggerVideoUpload"
                  >
                     {{ uploadingVideo ? '上传中...' : '上传视频' }}
                  </el-button>
                </template>
              </el-input>
              <input 
                type="file" 
                ref="videoInputRef" 
                style="display: none" 
                accept="video/*" 
                @change="handleVideoChange"
              >
            </el-form-item>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              {{ isEditMode ? '保存修改' : '立即发布' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, VideoCamera } from '@element-plus/icons-vue'
import movieService from '@/services/movieService'

const route = useRoute()
const router = useRouter()
const movieFormRef = ref(null)
const submitting = ref(false)

// 上传相关状态
const posterInputRef = ref(null)
const videoInputRef = ref(null)
const uploadingPoster = ref(false)
const uploadingVideo = ref(false)

// 后端地址常量 - 确保这里是你后端的真实地址
const API_BASE_URL = 'http://localhost:3000'

// 辅助函数：处理图片路径 (关键修复)
const getFileUrl = (url) => {
  if (!url) return ''
  
  // 1. 如果是网络图片 (http/https) 或本地预览 (blob)，直接返回
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
    return url
  }
  
  // 2. 处理 Windows 路径分隔符：将反斜杠 \ 替换为正斜杠 /
  // 例如：uploads\123.jpg -> uploads/123.jpg
  let cleanUrl = url.replace(/\\/g, '/')
  
  // 3. 确保路径以 / 开头，防止拼接错误
  // 例如：uploads/123.jpg -> /uploads/123.jpg
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl
  }
  
  // 4. 拼接后端地址
  // 结果：http://localhost:3000/uploads/123.jpg
  return `${API_BASE_URL}${cleanUrl}`
}

const isEditMode = computed(() => !!route.params.id)

const movieForm = reactive({
  title: '',
  genre: '',
  director: '',
  starring: '',
  release_date: '',
  duration: 90,
  plot: '',
  poster_url: '',
  video_url: ''
})

const genreOptions = ['动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '动画', '剧情', '纪录片']

const rules = {
  title: [{ required: true, message: '请输入电影名称', trigger: 'blur' }],
  genre: [{ required: true, message: '请选择或输入电影类型', trigger: 'change' }],
  plot: [{ required: true, message: '请输入剧情简介', trigger: 'blur' }],
  poster_url: [{ required: true, message: '请提供电影海报', trigger: 'change' }]
}

onMounted(async () => {
  if (isEditMode.value) {
    await fetchMovieDetail(route.params.id)
  }
})

const fetchMovieDetail = async (id) => {
  try {
    const res = await movieService.getMovieById(id)
    if (res.success) {
      Object.assign(movieForm, res.data)
    }
  } catch (error) {
    ElMessage.error('获取电影详情失败')
    router.push('/movies')
  }
}

const triggerPosterUpload = () => posterInputRef.value.click()
const triggerVideoUpload = () => videoInputRef.value.click()

const handlePosterChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 先设置本地预览，提升体验 (可选)
  // movieForm.poster_url = URL.createObjectURL(file)

  try {
    uploadingPoster.value = true
    const res = await movieService.uploadFile(file)
    
    // 兼容不同的后端返回格式
    const url = res.data?.url || res.url || res.data
    
    if (url) {
      movieForm.poster_url = url
      ElMessage.success('海报上传成功')
    } else {
      ElMessage.error('上传成功但无法解析URL')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadingPoster.value = false
    event.target.value = '' 
  }
}

const handleVideoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('video/')) {
    ElMessage.error('请选择视频文件')
    return
  }

  try {
    uploadingVideo.value = true
    const res = await movieService.uploadFile(file)
    const url = res.data?.url || res.url || res.data
    
    if (url) {
      movieForm.video_url = url
      ElMessage.success('视频上传成功')
    } else {
      ElMessage.error('上传失败：无法获取文件地址')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('视频上传失败，可能是文件过大')
  } finally {
    uploadingVideo.value = false
    event.target.value = ''
  }
}

const submitForm = async () => {
  if (!movieFormRef.value) return
  
  await movieFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        let response
        
        if (isEditMode.value) {
          response = await movieService.updateMovie(route.params.id, movieForm)
        } else {
          response = await movieService.createMovie(movieForm)
        }

        if (response.success) {
          ElMessage.success(isEditMode.value ? '修改成功' : '发布成功')
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
             router.push('/movies')
          }, 800)
        } else {
          ElMessage.error(response.error || '操作失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('服务器错误，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.publish-movie-page {
  padding: 40px 0;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.form-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.form-header p {
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.form-section {
  margin-bottom: 40px;
}

.preview-image {
  margin-top: 10px;
  width: 150px; /* 稍微调大一点 */
  height: 225px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  background-color: #f0f0f0;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-card {
    padding: 20px;
  }
}
</style>