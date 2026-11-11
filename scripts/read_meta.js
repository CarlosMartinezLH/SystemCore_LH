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
    const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
    const descMatch = data.match(/content="([^"]*)"\s+name="description"/i) || data.match(/name="description"\s+content="([^"]*)"/i);
    console.log('TITLE:', titleMatch ? titleMatch[1] : 'none');
    console.log('DESC:', descMatch ? descMatch[1] : 'none');
  });
});
