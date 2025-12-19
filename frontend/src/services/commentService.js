import api from './api';

export default {
  // 获取评论
  getCommentsByMovieId(movieId) {
    // 对应后端: router.get('/movie/:movieId', ...)
    return api.get(`/comments/movie/${movieId}`);
  },

  // 发表评论
  createComment(data) {
    // data: { movie_id, content, parentId }
    // 对应后端: router.post('/movie/:movieId', ...)
    // 注意：movie_id 放在 URL 中，content 放在 body 中
    return api.post(`/api/comments/movie/${data.movie_id}`, {
      content: data.content,
      parentId: data.parentId
    });
  },

  // 删除评论
  deleteComment(id) {
    return api.delete(`/comments/${id}`);
  },
  
  // 提交评分
  submitRating(data) {
    // data: { movie_id, rating }
    // 对应后端: router.post('/movie/:movieId', ...)
    // 注意：movie_id 放在 URL 中
    return api.post(`/ratings/movie/${data.movie_id}`, {
      rating: data.rating
    });
  },

  // 获取当前用户对某电影的评分（可选，如果需要在详情页回显用户评分）
  getUserRating(movieId) {
    return api.get(`/ratings/movie/${movieId}/user`);
  }
};