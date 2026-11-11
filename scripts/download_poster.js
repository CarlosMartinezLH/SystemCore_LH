const https = require('https');
const fs = require('fs');

const url = 'https://scontent.cdninstagram.com/v/t51.82787-15/885311343_18642330718037766_8351414766341644996_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=tVon0e__cUsQ7kNvwFAMzga&_nc_oc=Adrs2IMfa2fJRMMmraxBCE02ud3n-u3dcr7PNxAA0IuN6oR-lQ8CcSwDMkiLieFncu8&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=z9U1SuEXlIgL9B_Xivk5qA&_nc_ss=7060f&oh=00_AQTQWz7WQuOFtLV3SKVS_602WRWp8trFIj_3XO8Pxsxk4Q&oe=6AF81B87';

const file = fs.createWriteStream('scripts/reel_poster.jpg');
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download completed');
    });
  });
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
});
