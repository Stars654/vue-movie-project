import api from './api'

export default {
  // 获取电影列表（支持搜索和筛选）
  async getMovies(params = {}) {
    console.log('🎬 请求电影列表，参数:', params) // 添加调试日志
    
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 12,
      // 根据后端接口需要的参数名进行调整
    }
    
    // 处理搜索参数
    if (params.search && params.search.trim()) {
      queryParams.keyword = params.search.trim()
      // 或者 queryParams.q = params.search.trim()
      // 或者 queryParams.search = params.search.trim()
    }
    
    // 处理类型筛选
    if (params.genre && params.genre !== 'all') {
      queryParams.type = params.genre
      // 或者 queryParams.genre = params.genre
      // 或者 queryParams.category = params.genre
    }
    
    // 处理排序
    if (params.sort) {
      // 映射前端排序参数到后端参数
      const sortMapping = {
        newest: 'created_at',
        rating: 'rating',
        views: 'views'
      }
      queryParams.sortBy = sortMapping[params.sort] || params.sort
      queryParams.order = 'desc' // 默认降序
    }
    
    console.log('📡 最终查询参数:', queryParams)
    
    try {
      const response = await api.get('/movies', { params: queryParams })
      console.log('✅ 电影列表响应:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 获取电影列表失败:', error)
      throw error
    }
  },

  // 专门的搜索电影方法
  async searchMovies(keyword, params = {}) {
    console.log('🔍 搜索电影:', keyword)
    
    const queryParams = {
      keyword: keyword.trim(),
      page: params.page || 1,
      limit: params.limit || 12
    }
    
    // 添加筛选参数
    if (params.genre && params.genre !== 'all') {
      queryParams.type = params.genre
    }
    
    if (params.sort) {
      const sortMapping = {
        newest: 'created_at',
        rating: 'rating',
        views: 'views'
      }
      queryParams.sortBy = sortMapping[params.sort] || params.sort
    }
    
    try {
      // 先尝试搜索接口
      const response = await api.get('/movies/search', { params: queryParams })
      return response.data
    } catch (error) {
      console.log('搜索接口失败，尝试普通接口:', error.message)
      // 回退到普通接口
      return this.getMovies({ ...params, search: keyword })
    }
  },

  // 获取热门电影
  async getTopMovies(limit = 10) {
    const response = await api.get('/movies/top', { params: { limit } })
    return response.data
  },

  // 获取电影详情
  async getMovieById(id) {
    const response = await api.get(`/movies/${id}`)
    return response.data
  },

  // 创建电影
  async createMovie(movieData) {
    const response = await api.post('/movies', movieData)
    return response.data
  },

  // 更新电影
  async updateMovie(id, movieData) {
    const response = await api.put(`/movies/${id}`, movieData)
    return response.data
  },

  // 删除电影
  async deleteMovie(id) {
    const response = await api.delete(`/movies/${id}`)
    return response.data
  },

  // 获取用户自己的电影
  async getUserMovies() {
    const response = await api.get('/movies/user/movies')
    return response.data
  },

  // 上传文件
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 获取电影类型列表
  async getMovieTypes() {
    try {
      const response = await api.get('/movies/types')
      return response.data
    } catch (error) {
      console.warn('获取电影类型失败，使用默认类型列表')
      // 返回默认类型列表
      return {
        success: true,
        data: [
          '动作', '喜剧', '爱情', '科幻', '恐怖', '悬疑', '动画', '剧情',
          '冒险', '奇幻', '犯罪', '战争', '纪录片', '音乐', '家庭', '传记'
        ]
      }
    }
  }
}