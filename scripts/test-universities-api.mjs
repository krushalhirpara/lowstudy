import { GET } from '../src/app/api/universities/route.js';

async function testUniversitiesApi() {
  console.log('Testing GET /api/universities...');
  const req = new Request('http://localhost:3000/api/universities');
  const res = await GET(req);
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', {
    success: data.success,
    count: data.count,
    sampleUni: data.universities?.[0]
  });

  if (res.status === 200 && data.success && data.count >= 9) {
    console.log('✅ GET /api/universities PASSED');
  } else {
    throw new Error('GET /api/universities FAILED');
  }
}

testUniversitiesApi().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
