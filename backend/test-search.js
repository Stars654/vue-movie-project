const db = require('./config/database');

async function testMovieSearch(options = {}) {
  const {
    page = 1,
    limit = 5,
    sort = 'newest',
    genre = 'all',
    search = ''
  } = options;

  const offset = (page - 1) * limit;

  let whereConditions = ["1=1"];
  let queryParams = [];

  console.log(`\n--- Testing with: search='${search}', genre='${genre}', sort='${sort}' ---`);

  if (genre && genre !== 'all') {
    whereConditions.push("m.genre LIKE ?");
    queryParams.push(`%${genre}%`);
  }
  if (search && search.length > 0) {
    whereConditions.push("(m.title LIKE ? OR m.plot LIKE ? OR m.director LIKE ? OR m.starring LIKE ?)");
    const term = `%${search}%`;
    queryParams.push(term, term, term, term);
  }

  const whereSQL = 'WHERE ' + whereConditions.join(' AND ');

  let orderBy = 'ORDER BY m.created_at DESC';
  if (sort === 'rating') orderBy = 'ORDER BY avg_rating DESC';
  if (sort === 'views') orderBy = 'ORDER BY m.view_count DESC';

  const query = `
      SELECT m.id, m.title, m.genre, m.director, m.starring, m.view_count,
             AVG(r.rating) as avg_rating
      FROM movies m
      LEFT JOIN ratings r ON m.id = r.movie_id
      ${whereSQL}
      GROUP BY m.id
      ${orderBy}
      LIMIT ? OFFSET ?
  `;
  const finalParams = [...queryParams, limit, offset];

  console.log('Generated SQL:');
  console.log(query.trim());
  console.log('\nQuery Parameters:', finalParams);

  try {
    const [movies] = await db.execute(query, finalParams);
    console.log(`\nFound ${movies.length} results:`);
    console.log(movies.map(m => ({ id: m.id, title: m.title, genre: m.genre, avg_rating: m.avg_rating })));

    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM movies m ${whereSQL}`, queryParams);
    console.log(`Total count from a separate query: ${countResult[0].total}`);

  } catch (error) {
    console.error('\n---!!! Query Failed !!!---');
    console.error('Error:', error.message);
    if (error.sql) {
        console.error('Failed SQL:', error.sql);
    }
  }
}

async function runTests() {
  console.log('=== Starting Backend Search Logic Test ===');

  // Test Case 1: Search by keyword
  await testMovieSearch({ search: '复仇者' });

  // Test Case 2: Search by genre and sort by rating
  await testMovieSearch({ genre: '爱情', sort: 'rating' });

  // Test Case 3: Search by keyword and genre
  await testMovieSearch({ search: '动作', genre: '动作' });
    
  // Test Case 4: Empty search, should return all movies sorted by newest
  await testMovieSearch({});

  // Test Case 5: Search with a non-existent keyword
  await testMovieSearch({ search: 'asdfghjkl' });

  console.log('\n=== Test Finished ===');
  
  // Close the database connection pool
  db.end();
}

runTests();