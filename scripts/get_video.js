const https = require('https');

const options = {
  hostname: 'www.instagram.com',
  path: '/reel/Dfc_QBNhDhW/',
  headers: {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const videoMatch = data.match(/content="([^"]*)"\s+property="og:video"/i) || data.match(/property="og:video"\s+content="([^"]*)"/i);
    console.log('VIDEO_URL:', videoMatch ? videoMatch[1].replace(/&amp;/g, '&') : 'none');
  });
});
