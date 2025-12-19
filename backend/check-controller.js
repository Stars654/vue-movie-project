console.log('检查控制器导出...\n');

// 尝试导入movieController
try {
    const movieController = require('./controllers/movieController');
    
    console.log('✅ movieController 导入成功');
    
    // 检查各个方法是否存在
    const methods = [
        'getMovies',
        'getTopMovies',
        'getMovieById', 
        'createMovie',
        'updateMovie',
        'deleteMovie',
        'getUserMovies'
    ];
    
    methods.forEach(method => {
        if (typeof movieController[method] === 'function') {
            console.log(`✅ ${method}: ✓ (函数)`);
        } else if (movieController[method] !== undefined) {
            console.log(`❓ ${method}: ${typeof movieController[method]}`);
        } else {
            console.log(`❌ ${method}: undefined (未找到!)`);
        }
    });
    
} catch (error) {
    console.error('❌ 导入movieController失败:', error.message);
    console.error('详细错误:', error.stack);
}

console.log('\n---\n');

// 检查文件是否存在
const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'movieController.js');
console.log(`检查文件: ${controllerPath}`);

if (fs.existsSync(controllerPath)) {
    console.log('✅ movieController.js 文件存在');
    
    // 读取文件内容
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    // 检查导出语句
    if (content.includes('exports.getMovies') || content.includes('module.exports')) {
        console.log('✅ 文件中包含导出语句');
    } else {
        console.log('❌ 文件中没有找到导出语句');
    }
} else {
    console.log('❌ movieController.js 文件不存在');
}