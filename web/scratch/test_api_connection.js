async function testAPIs() {
  const query = 'developer';
  const encodedQuery = encodeURIComponent(query);
  
  console.log('Testing Glints API...');
  try {
    const res = await fetch(`https://gateway.glints.com/api/v1/search/jobs?keyword=${encodedQuery}&limit=5`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://glints.com/id/opportunities/jobs',
        'Origin': 'https://glints.com'
      }
    });
    console.log(`Glints Response Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Glints found ${data.data?.length || 0} jobs.`);
    } else {
      const text = await res.text();
      console.log(`Glints Error Body: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error('Glints Error:', err);
  }

  console.log('\nTesting Kalibrr API...');
  try {
    const res = await fetch(`https://kbrr-jobs-api.kalibrr.com/v1/jobs?search=${encodedQuery}&limit=5`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.kalibrr.com/',
        'Origin': 'https://www.kalibrr.com'
      }
    });
    console.log(`Kalibrr Response Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Kalibrr found ${data.data?.length || 0} jobs.`);
    } else {
      const text = await res.text();
      console.log(`Kalibrr Error Body: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error('Kalibrr Error:', err);
  }
}

testAPIs();
