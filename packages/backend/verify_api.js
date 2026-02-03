const https = require('http');

const BASE_URL = 'http://localhost:8000';

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(`${BASE_URL}${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting Document API Verification with Timing...\n');

  try {
    // 1. Create Portfolio
    console.log('--- Test 1: Create Portfolio ---');
    console.time('Create Portfolio');
    const createPfRes = await request('POST', '/document/portfolio/create', {
      title: 'Test Portfolio',
      content: 'Portfolio Content'
    });
    console.timeEnd('Create Portfolio');
    
    console.log(`Status: ${createPfRes.status}`);
    // console.log('Response:', createPfRes.data);

    if (createPfRes.status !== 201) throw new Error('Failed to create portfolio');
    const pfDocId = createPfRes.data.documentId;
    console.log('Created Portfolio ID:', pfDocId);

    // 2. Verify List contains it
    console.log('\n--- Test 2: List Documents ---');
    console.time('List Documents');
    const listRes = await request('GET', '/document?page=1&take=10&sort=DESC');
    console.timeEnd('List Documents');

    const foundDoc = listRes.data.documents && listRes.data.documents.find(d => d.documentId === pfDocId);
    if (!foundDoc) throw new Error('Created portfolio not found in list');

    // 3. View Portfolio
    console.log('\n--- Test 3: View Portfolio ---');
    console.time('View Portfolio');
    const viewPfRes = await request('GET', `/document/${pfDocId}/portfolio`);
    console.timeEnd('View Portfolio');

    if (viewPfRes.status !== 200) throw new Error('Failed to view portfolio');

    // 4. Delete Portfolio
    console.log('\n--- Test 4: Delete Portfolio ---');
    console.time('Delete Portfolio');
    const delPfRes = await request('DELETE', `/document/${pfDocId}/portfolio`);
    console.timeEnd('Delete Portfolio');

    if (delPfRes.status !== 204) throw new Error('Failed to delete portfolio');

    // 5. Verify Portfolio Deletion
    console.log('\n--- Test 5: Verify Deletion ---');
    console.time('Verify Deletion (List)');
    const listRes3 = await request('GET', '/document?page=1&take=10&sort=DESC');
    console.timeEnd('Verify Deletion (List)');
    
    const foundDoc3 = listRes3.data.documents && listRes3.data.documents.find(d => d.documentId === pfDocId);
    if (foundDoc3) throw new Error('Portfolio document still exists after deletion!');

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) console.error(error.response);
  }
}

runTests();
