const https = require('https');

const options = {
  hostname: 'www.instagram.com',
  path: '/reel/Dfc_QBNhDhW/',
  headers: {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  timeout: 5000
};

const req = https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const ogImage = data.match(/property="og:image"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:image"/i);
    const videoUrl = data.match(/property="og:video"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:video"/i);
    console.log('OG_IMAGE:', ogImage ? ogImage[1].replace(/&amp;/g, '&') : 'No image');
    console.log('OG_VIDEO:', videoUrl ? videoUrl[1].replace(/&amp;/g, '&') : 'No video');
  });
});

req.on('error', (e) => console.log('ERROR:', e.message));
req.on('timeout', () => { req.destroy(); console.log('TIMEOUT'); });
