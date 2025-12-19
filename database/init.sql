-- 创建数据库
CREATE DATABASE IF NOT EXISTS movie_recommendation 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE movie_recommendation;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 电影表
CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    plot TEXT NOT NULL,
    genre VARCHAR(100) NOT NULL,
    director VARCHAR(100) DEFAULT NULL,
    starring TEXT DEFAULT NULL,
    release_date DATE DEFAULT NULL,
    video_url VARCHAR(500) DEFAULT NULL,
    poster_url VARCHAR(500) DEFAULT NULL,
    duration INT DEFAULT NULL COMMENT '电影时长(分钟)',
    user_id INT NOT NULL,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    view_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评分表
CREATE TABLE IF NOT EXISTS ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_movie (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT DEFAULT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表（可选，如果实现收藏功能）
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_movie_fav (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入测试数据
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('testuser', 'user@example.com', '$2b$10$YourHashedPasswordHere', 'user');

-- 注意：实际密码需要先经过bcrypt加密，这里只是示例

-- 插入电影测试数据
INSERT INTO movies (title, plot, genre, director, starring, release_date, video_url, poster_url, duration, user_id, status, view_count)
VALUES
('复仇者联盟4：终局之战', '十年布局，一朝终局。', '动作,科幻,冒险', '安东尼·罗素,乔·罗素', '小罗伯特·唐尼,克里斯·埃文斯,马克·鲁弗洛', '2019-04-24', 'http://example.com/video/avengers4', 'http://example.com/poster/avengers4.jpg', 181, 1, 'approved', 1200),
('流浪地球', '在不久的将来，太阳即将毁灭，人类启动“流浪地球”计划。', '科幻,灾难', '郭帆', '吴京,屈楚萧,李光洁', '2019-02-05', 'http://example.com/video/wanderingearth', 'http://example.com/poster/wanderingearth.jpg', 125, 1, 'approved', 800),
('战狼2', '前特种兵冷锋被卷入非洲国家叛乱。', '动作,战争', '吴京', '吴京,弗兰克·格里罗,吴刚', '2017-07-27', 'http://example.com/video/wolfwarrior2', 'http://example.com/poster/wolfwarrior2.jpg', 123, 1, 'approved', 1500),
('我不是药神', '一位药店老板从印度代购廉价抗癌药。', '剧情,喜剧', '文牧野', '徐峥,王传君,周一围', '2018-07-05', 'http://example.com/video/dyingtosurvive', 'http://example.com/poster/dyingtosurvive.jpg', 117, 1, 'approved', 1000),
('少年的你', '一场高考前夕的校园意外，改变了两个少年的命运。', '剧情,爱情,犯罪', '曾国祥', '周冬雨,易烊千玺', '2019-10-25', 'http://example.com/video/betterdays', 'http://example.com/poster/betterdays.jpg', 135, 1, 'approved', 900),
('寻梦环游记', '一个鞋匠家庭出身的12岁墨西哥男孩米格尔，自幼有一个音乐梦。', '动画,音乐,奇幻', '李·昂克里奇', '安东尼·冈萨雷斯,盖尔·加西亚·贝纳尔', '2017-11-24', 'http://example.com/video/coco', 'http://example.com/poster/coco.jpg', 105, 1, 'approved', 700),
('泰坦尼克号', '一段荡气回肠的爱情故事。', '剧情,爱情,灾难', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥,凯特·温丝莱特', '1998-04-03', 'http://example.com/video/titanic', 'http://example.com/poster/titanic.jpg', 194, 1, 'approved', 2000);

-- 插入评分测试数据
INSERT INTO ratings (user_id, movie_id, rating)
VALUES
(1, 1, 4.5),
(2, 1, 5.0),
(1, 2, 4.0),
(2, 3, 4.5),
(1, 4, 5.0),
(2, 5, 4.0),
(1, 6, 4.5),
(2, 7, 5.0);

-- 插入评论测试数据
INSERT INTO comments (user_id, movie_id, content)
VALUES
(1, 1, '非常棒的电影，期待续集！'),
(2, 1, '特效很震撼，剧情也很感人。'),
(1, 2, '中国科幻的里程碑！'),
(2, 4, '现实主义题材，引人深思。');