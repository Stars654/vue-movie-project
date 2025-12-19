const db = require('./config/database');

async function checkDatabase() {
    console.log('📊 数据库完整性检查\n');
    
    try {
        // 1. 检查所有表
        console.log('1. 检查数据库表...');
        const [tables] = await db.execute('SHOW TABLES');
        console.log(`   找到 ${tables.length} 张表:`);
        tables.forEach(table => {
            console.log(`     - ${table[Object.keys(table)[0]]}`);
        });
        
        // 2. 检查users表
        console.log('\n2. 检查users表...');
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        console.log(`   用户数量: ${userCount[0].count}`);
        
        const [users] = await db.execute('SELECT username, email, role FROM users LIMIT 5');
        console.log('   示例用户:');
        users.forEach(user => {
            console.log(`     - ${user.username} (${user.email}) [${user.role}]`);
        });
        
        // 3. 检查movies表
        console.log('\n3. 检查movies表...');
        const [movieCount] = await db.execute('SELECT COUNT(*) as count FROM movies');
        console.log(`   电影数量: ${movieCount[0].count}`);
        
        if (movieCount[0].count > 0) {
            const [movies] = await db.execute('SELECT title, genre, status FROM movies LIMIT 5');
            console.log('   示例电影:');
            movies.forEach(movie => {
                console.log(`     - ${movie.title} [${movie.genre}] (${movie.status})`);
            });
        }
        
        // 4. 检查表结构
        console.log('\n4. 检查表结构...');
        const tableNames = tables.map(t => t[Object.keys(t)[0]]);
        for (const tableName of tableNames) {
            const [columns] = await db.execute(`DESCRIBE ${tableName}`);
            console.log(`   ${tableName} 表字段数: ${columns.length}`);
        }
        
        console.log('\n✅ 数据库检查完成！');
        return true;
    } catch (error) {
        console.error('❌ 数据库检查失败:', error.message);
        return false;
    }
}

checkDatabase();