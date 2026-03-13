# 电影评价系统 - 快速使用指南

## 📋 项目说明

这是一个基于Vue.js和Node.js开发的电影评价系统，采用前后端分离架构。

**主要功能**：
- ✅ 用户注册与登录
- ✅ 电影信息浏览与搜索
- ✅ 电影发布与管理
- ✅ 电影评分与评论
- ✅ 管理员后台管理

## 🚀 快速开始

### 1. 环境要求

- Node.js v16.0.0 或更高版本
- MySQL v8.0  5.7也行 或更高版本
- 推荐使用Chrome、Firefox或Edge浏览器

### 2. 安装步骤

#### 第一步：创建数据库

```sql
-- 登录MySQL后执行
CREATE DATABASE movie_rating_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 第二步：配置数据库连接

修改 `backend/.env` 文件中的数据库配置：

```env
DB_HOST=localhost    //注意：源码中因为本地未部署MySQL，而使用Docker运行在虚拟机中，因此填写的是虚拟机IP； 没做端口映射本地 若后续本地部署MySQL，可将DB_HOST改为localhost，同步调整.env中其他数据库配置（如账号/密码）否则 数据库连不上
DB_PORT=3306
DB_NAME=movie_rating_db
DB_USER=root
DB_PASSWORD=123456
```

#### 第三步：安装依赖 

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 第四步：初始化数据库 （不用初始化也行运行后端会自动初始化）

```bash
# 在backend目录下执行
cd backend
npm run init-db
```

初始化成功后会自动创建管理员账号：
- 用户名：`admin`
- 密码：`admin123`

#### 第五步：启动项目

**启动后端**（在backend目录）：
```bash
npm run dev
```
后端服务将运行在：http://localhost:3000

**启动前端**（在frontend目录，新开一个终端）：
```bash
npm run dev
```
前端服务将运行在：http://localhost:5173

### 3. 访问系统

打开浏览器访问：http://localhost:5173

## 👤 测试账号

**管理员账号**：
- 用户名：`admin`
- 密码：`admin123`

**普通用户**：
- 需要自行注册

## 📖 主要功能使用

### 用户注册
1. 点击右上角"注册"按钮
2. 填写用户名、邮箱和密码
3. 点击"注册"完成

### 发布电影
1. 登录后点击"发布电影"
2. 填写电影信息并上传海报
3. 点击"发布"

### 评价电影
1. 进入电影详情页
2. 选择评分（1-5星）
3. 撰写评论（可选）
4. 点击"提交评价"

### 管理员功能
1. 使用管理员账号登录
2. 点击"管理后台"
3. 可以管理所有电影和查看用户列表

## 🛠️ 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认.env文件中的数据库配置是否正确
- 确认数据库已创建

### 2. 端口被占用
- 后端默认端口：3000
- 前端默认端口：5173
- 如果端口被占用，可以在配置文件中修改

### 3. 图片上传失败
- 确保图片格式为JPG、PNG、GIF或WEBP
- 图片大小不超过5MB
- 检查backend/public/uploads目录是否有写入权限

## 📁 项目结构

```
movie-rating-system/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API接口
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 组件
│   │   ├── composables/     # 组合式函数
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # 状态管理
│   │   ├── styles/          # 样式文件
│   │   ├── utils/           # 工具函数
│   │   ├── views/           # 页面组件
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   ├── public/              # 公共资源
│   ├── index.html           # HTML模板
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite配置
├── backend/                 # 后端项目
│   ├── config/              # 配置文件
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── scripts/             # 脚本
│   ├── public/              # 静态文件
│   ├── server.js            # 服务器入口
│   ├── package.json         # 依赖配置
│   └── .env                 # 环境变量
└── README.md                # 项目说明/使用手册
```





## 💻 技术栈

**前端**：Vue 3 + Vite + Element Plus + Vue Router + Pinia + Axios

**后端**：Node.js + Express + MySQL + Sequelize + JWT + Bcrypt


**祝您使用愉快！** 🎉
