const axios = require('axios');

// 后端API的基础URL
const BASE_URL = 'http://localhost:3000/api';

/**
 * 发送请求并打印结果的辅助函数
 * @param {string} endpoint - API端点
 * @param {object} params - 查询参数
 * @param {string} testName - 测试名称
 */
async function performTest(endpoint, params, testName) {
  console.log(`\n--- ${testName} ---`);
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
    console.log(`✅ 请求成功 (状态码: ${response.status})`);
    
    // 打印完整的响应数据以便调试
    console.log('完整响应数据:', JSON.stringify(response.data, null, 2));

    // 尝试解析和打印关键信息
    const movies = response.data.data?.movies || response.data.data || response.data.movies || response.data;
    const total = response.data.pagination?.total ?? response.data.total ?? (Array.isArray(movies) ? movies.length : '未知');

    if (Array.isArray(movies)) {
      console.log(`🎬 找到 ${movies.length} 部电影`);
      console.log(`🔢 后端报告总数: ${total}`);
    } else {
      console.warn('⚠️ 无法解析电影列表，请检查上面的完整响应数据。');
    }

  } catch (error) {
    console.error(`❌ 测试失败: ${testName}`);
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error('响应体:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('请求已发出但没有收到响应。请确保后端服务正在运行，并且端口和URL正确。');
      console.error('错误信息:', error.message);
    } else {
      console.error('请求设置时出错:', error.message);
    }
  }
  console.log('--------------------------');
}

async function runApiTests() {
  console.log('🚀 开始API搜索功能测试...');
  console.log(`(请确保后端服务正在 http://localhost:3000 上运行)`);

  // 测试1: 获取所有电影 (不带任何参数)
  await performTest('/movies', {}, '测试1: 获取所有电影');

  // 测试2: 带有效搜索关键词
  // 请将 '动作' 替换为你的数据库中确定存在的电影类型或标题中的词
  await performTest('/movies', { keyword: '动作' }, "测试2: 搜索关键词 '动作'");
  
  // 测试3: 带另一个有效搜索关键词
  // 请将 '喜剧' 替换为你的数据库中确定存在的电影类型或标题中的词
  await performTest('/movies', { keyword: '喜剧' }, "测试3: 搜索关键词 '喜剧'");

  // 测试4: 带一个很可能不存在的搜索关键词
  await performTest('/movies', { keyword: '这是一个绝对没人用的搜索词' }, "测试4: 搜索无效关键词");
  
  // 测试5: 仅带分页参数
  await performTest('/movies', { page: 2, limit: 5 }, "测试5: 仅使用分页参数");

  console.log('\n🏁 API测试完成。');
  console.log('请分析以上输出，判断搜索功能是否按预期工作。');
  console.log('主要关注点:');
  console.log('1. "后端报告总数" 在不同搜索条件下是否发生变化。');
  console.log('2. 如果没有变化，说明后端搜索逻辑可能存在问题。');
  console.log('3. 如果有变化，但前端页面不更新，说明问题可能出在前端状态管理或请求参数传递上。');
}

runApiTests();