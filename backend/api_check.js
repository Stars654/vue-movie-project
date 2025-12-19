const axios = require('axios');

// Backend API base URL
const BASE_URL = 'http://localhost:3000/api';

/**
 * Helper function to send requests and print results
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters
 * @param {string} testName - Test name
 */
async function performTest(endpoint, params, testName) {
  console.log(`\n--- ${testName} ---`);
  console.log(`Requesting: ${BASE_URL}${endpoint} with params: ${JSON.stringify(params)}`);
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
    console.log(`✅ Request successful (Status: ${response.status})`);
    
    // Log the full response data for debugging
    console.log('Full response data:', JSON.stringify(response.data, null, 2));

    // Try to parse and print key information
    const movies = response.data.data?.movies || response.data.data || response.data.movies || response.data;
    const total = response.data.pagination?.total ?? response.data.total ?? (Array.isArray(movies) ? movies.length : 'Unknown');

    if (Array.isArray(movies)) {
      console.log(`🎬 Found ${movies.length} movies`);
      console.log(`🔢 Backend reports total: ${total}`);
      if (movies.length > 0) {
        console.log('First movie title:', movies[0].title);
      }
    } else {
      console.warn('⚠️ Could not parse movie list. Please check the full response data above.');
    }

  } catch (error) {
    console.error(`❌ Test failed: ${testName}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response body:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Request was made but no response was received. Ensure the backend service is running and the URL is correct.');
      console.error('Error message:', error.message);
    } else {
      console.error('Error setting up the request:', error.message);
    }
  }
  console.log('--------------------------');
}

async function runApiChecks() {
  console.log('🚀 Starting comprehensive API search checks...');
  console.log(`(Ensure backend service is running on http://localhost:3000)`);

  const searchTerm = '动作'; // A term likely to exist in your data, e.g., a genre or keyword in a title

  // Test 1: Get all movies (no params)
  await performTest('/movies', {}, 'Test 1: Get all movies');

  // --- Test different search parameter names ---
  console.log('\n\n--- Testing different search parameter names ---');
  // Test 2: Using 'keyword'
  await performTest('/movies', { keyword: searchTerm }, `Test 2: Search with 'keyword=${searchTerm}'`);
  
  // Test 3: Using 'search'
  await performTest('/movies', { search: searchTerm }, `Test 3: Search with 'search=${searchTerm}'`);

  // Test 4: Using 'q'
  await performTest('/movies', { q: searchTerm }, `Test 4: Search with 'q=${searchTerm}'`);

  // --- Test combinations ---
  console.log('\n\n--- Testing parameter combinations ---');
  // Test 5: Search with pagination
  await performTest('/movies', { keyword: searchTerm, page: 1, limit: 2 }, `Test 5: Search with 'keyword' and pagination`);

  // Test 6: Search with type filter
  // Replace '喜剧' with a genre that exists in your data and is different from the search term if possible
  await performTest('/movies', { keyword: '爱情', type: '喜剧' }, `Test 6: Search with 'keyword' and 'type' filter`);
  
  // Test 7: Search with an unlikely term
  await performTest('/movies', { keyword: 'абвгд' }, "Test 7: Search with a non-existent keyword");

  console.log('\n🏁 API checks complete.');
  console.log('Analyze the output above to determine the correct search parameter and behavior.');
  console.log('Key points to check:');
  console.log('1. Which test (2, 3, or 4) returns a filtered list of movies? The parameter used in that test is the correct one.');
  console.log('2. Does the "Backend reports total" number change correctly when searching?');
  console.log('3. Do combinations (pagination, filtering) work with the search parameter?');
}

runApiChecks();