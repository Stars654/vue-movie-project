<template>
  <div id="app">
    <el-config-provider :locale="zhCn">
      <Header v-if="showHeader" />
      <main :class="{ 'has-header': showHeader }">
        <router-view />
      </main>
      <Footer v-if="showFooter" />
    </el-config-provider>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'

const route = useRoute()

// 在登录/注册页面不显示Header和Footer
const showHeader = computed(() => {
  return !['login', 'register'].includes(route.name)
})

const showFooter = computed(() => {
  return !['login', 'register'].includes(route.name)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 20px;
}

main.has-header {
  padding-top: 80px; /* Header高度 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  main {
    padding: 10px;
  }
  
  main.has-header {
    padding-top: 70px;
  }
  
  .container {
    padding: 0 10px;
  }
}
</style>