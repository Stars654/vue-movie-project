<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">电影推荐系统</h3>
          <p class="footer-description">
            一个基于Vue.js和Node.js的电影评价与推荐平台
          </p>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/movies">电影列表</router-link></li>
            <li><a href="#" @click.prevent="goToTopMovies">热门电影</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">联系我们</h3>
          <div class="contact-info">
            <p>邮箱: contact@movierec.com</p>
            <p>电话: 400-123-4567</p>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2023 电影推荐系统. 毕业设计项目</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToTopMovies = () => {
  router.push({ path: '/movies', query: { sort: 'rating' } })
}
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 40px 0 20px;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h3 {
  color: white;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.footer-description {
  line-height: 1.6;
  color: #bdc3c7;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #3498db;
}

.contact-info p {
  color: #bdc3c7;
  margin-bottom: 8px;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer {
    padding: 30px 0 15px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>