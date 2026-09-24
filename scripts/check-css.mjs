async function check() {
  try {
    const res = await fetch('http://localhost:3000/');
    const html = await res.text();
    console.log('Status:', res.status, 'HTML length:', html.length);
    
    // Find all css links
    const matches = html.match(/href="([^"]+\.css[^"]*)"/g) || [];
    console.log('Found CSS matches count:', matches.length);
    for (const m of matches) {
      const href = m.replace('href="', '').replace('"', '');
      console.log('Checking CSS:', href);
      const cssRes = await fetch('http://localhost:3000' + href);
      const cssText = await cssRes.text();
      console.log('CSS URL:', href, 'Status:', cssRes.status, 'Length:', cssText.length);
      console.log('Contains flex:', cssText.includes('flex'));
      console.log('Contains bg-slate:', cssText.includes('bg-slate'));
      console.log('Sample:', cssText.slice(0, 200));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
