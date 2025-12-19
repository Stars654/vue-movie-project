<template>
  <el-dialog
    v-model="visible"
    title="推荐电影"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="movie-form"
    >
      <el-form-item label="电影名称" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入电影名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="电影类型" prop="genre">
        <el-select
          v-model="form.genre"
          placeholder="选择电影类型"
          style="width: 100%"
        >
          <el-option label="动作" value="动作" />
          <el-option label="喜剧" value="喜剧" />
          <el-option label="爱情" value="爱情" />
          <el-option label="科幻" value="科幻" />
          <el-option label="恐怖" value="恐怖" />
          <el-option label="悬疑" value="悬疑" />
          <el-option label="动画" value="动画" />
          <el-option label="剧情" value="剧情" />
        </el-select>
      </el-form-item>

      <el-form-item label="导演" prop="director">
        <el-input
          v-model="form.director"
          placeholder="请输入导演姓名"
        />
      </el-form-item>

      <el-form-item label="主演" prop="starring">
        <el-input
          v-model="form.starring"
          placeholder="请输入主演"
          type="textarea"
          :rows="2"
        />
      </el-form-item>

      <el-form-item label="上映日期" prop="release_date">
        <el-date-picker
          v-model="form.release_date"
          type="date"
          placeholder="选择上映日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="电影时长" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="1"
          :max="600"
          placeholder="分钟"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="海报链接" prop="poster_url">
        <el-input
          v-model="form.poster_url"
          placeholder="请输入电影海报图片链接"
        />
        <small class="form-hint">可输入网络图片链接，例如: https://example.com/poster.jpg</small>
      </el-form-item>

      <el-form-item label="电影情节" prop="plot">
        <el-input
          v-model="form.plot"
          type="textarea"
          :rows="4"
          placeholder="请输入电影情节介绍"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交推荐
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import movieService from '@/services/movieService'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits(['update:visible', 'success'])

// 表单相关
const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  title: '',
  plot: '',
  genre: '',
  director: '',
  starring: '',
  release_date: '',
  poster_url: '',
  duration: null
})

// 验证规则
const rules = {
  title: [
    { required: true, message: '请输入电影名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  plot: [
    { required: true, message: '请输入电影情节', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  genre: [
    { required: true, message: '请选择电影类型', trigger: 'change' }
  ]
}

// 监听对话框显示/隐藏
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 方法
const handleClose = () => {
  emits('update:visible', false)
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  form.duration = null
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = {
      title: form.title,
      plot: form.plot,
      genre: form.genre,
      director: form.director || null,
      starring: form.starring || null,
      release_date: form.release_date || null,
      poster_url: form.poster_url || null,
      duration: form.duration || null
    }

    const response = await movieService.createMovie(submitData)

    if (response.success) {
      ElMessage.success('电影推荐提交成功，等待管理员审核！')
      emits('success')
      handleClose()
    } else {
      ElMessage.error(response.error || '提交失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.movie-form {
  padding: 0 10px;
}

.form-hint {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>