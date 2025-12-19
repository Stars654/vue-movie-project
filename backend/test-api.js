const http = require('http');

const tests = [
    { name: '服务器状态', path: '/' },
    { name: 'API测试', path: '/api/test' },
    { name: '数据库连接', path: '/api/test-db' },
    { name: '数据库表', path: '/api/tables' }
];

async function runTests() {
    console.log('🚀 开始API测试...\n');
    
    for (const test of tests) {
        await new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: test.path,
                method: 'GET'
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`✅ ${test.name} (${test.path})`);
                    console.log(`   状态码: ${res.statusCode}`);
                    console.log(`   响应: ${data.substring(0, 100)}...\n`);
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.log(`❌ ${test.name} (${test.path})`);
                console.log(`   错误: ${error.message}\n`);
                resolve();
            });
            
            req.end();
        });
    }
    
    console.log('📊 测试完成！');
}

runTests();