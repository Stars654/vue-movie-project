// 测试修复后的createMovie逻辑
function testDataProcessing() {
    console.log('测试数据处理逻辑...\n');
    
    const testCases = [
        {
            name: '完整数据',
            input: {
                title: '完整测试电影',
                plot: '这是一个完整的测试电影情节',
                genre: '剧情,测试',
                director: '测试导演',
                starring: '演员1,演员2',
                release_date: '2023-01-01',
                video_url: 'http://example.com/video.mp4',
                poster_url: 'http://example.com/poster.jpg',
                duration: 120
            }
        },
        {
            name: '空字符串',
            input: {
                title: '空字符串测试',
                plot: '测试情节',
                genre: '测试',
                director: '',
                starring: '',
                release_date: '',
                video_url: '',
                poster_url: '',
                duration: ''
            }
        },
        {
            name: 'undefined值',
            input: {
                title: 'Undefined测试',
                plot: '测试情节',
                genre: '测试',
                director: undefined,
                starring: undefined,
                release_date: undefined,
                video_url: undefined,
                poster_url: undefined,
                duration: undefined
            }
        },
        {
            name: 'null值',
            input: {
                title: 'Null测试',
                plot: '测试情节',
                genre: '测试',
                director: null,
                starring: null,
                release_date: null,
                video_url: null,
                poster_url: null,
                duration: null
            }
        },
        {
            name: '混合值',
            input: {
                title: '混合测试',
                plot: '测试情节',
                genre: '测试',
                director: '导演',
                starring: '',  // 空字符串
                release_date: undefined,  // undefined
                video_url: null,  // null
                poster_url: 'http://example.com/poster.jpg',
                duration: '120'  // 字符串数字
            }
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`测试: ${testCase.name}`);
        console.log('输入:', testCase.input);
        
        // 模拟处理逻辑
        const processed = {
            title: testCase.input.title.trim(),
            plot: testCase.input.plot.trim(),
            genre: testCase.input.genre.trim(),
            director: testCase.input.director !== undefined && testCase.input.director !== null && testCase.input.director !== '' ? testCase.input.director.trim() : null,
            starring: testCase.input.starring !== undefined && testCase.input.starring !== null && testCase.input.starring !== '' ? testCase.input.starring.trim() : null,
            release_date: testCase.input.release_date !== undefined && testCase.input.release_date !== null && testCase.input.release_date !== '' ? testCase.input.release_date : null,
            video_url: testCase.input.video_url !== undefined && testCase.input.video_url !== null && testCase.input.video_url !== '' ? testCase.input.video_url.trim() : null,
            poster_url: testCase.input.poster_url !== undefined && testCase.input.poster_url !== null && testCase.input.poster_url !== '' ? testCase.input.poster_url.trim() : null,
            duration: testCase.input.duration !== undefined && testCase.input.duration !== null && testCase.input.duration !== '' ? parseInt(testCase.input.duration) : null,
        };
        
        // 检查undefined
        for (const [key, value] of Object.entries(processed)) {
            if (value === undefined) {
                processed[key] = null;
            }
        }
        
        console.log('处理后:', processed);
        
        // 检查SQL参数
        const sqlParams = [
            processed.title,
            processed.plot,
            processed.genre,
            processed.director,
            processed.starring,
            processed.release_date,
            processed.video_url,
            processed.poster_url,
            processed.duration
        ];
        
        console.log('SQL参数:', sqlParams.map(p => p === null ? 'NULL' : (typeof p === 'string' ? `"${p}"` : p)));
        console.log('---\n');
    });
}

testDataProcessing();