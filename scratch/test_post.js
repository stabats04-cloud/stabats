const https = require('https');

const postData = new URLSearchParams({
  timestamp: new Date().toLocaleString(),
  firstName: 'Aravindh',
  lastName: 'Cherala',
  phone: '+1 234 567 8900',
  email: 'aravindh@stabats.com',
  service: 'Custom Software & Cloud Architecture',
  message: 'Testing direct submission from scratch script'
}).toString();

const options = {
  hostname: 'script.google.com',
  path: '/macros/s/AKfycbxqUE_KfvrliZfOnTAxwF3AOOgWhOsNgKV3WS1rLtJU8ycyF8XJduoIISzpsJWJYeTw/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('HTTP Status:', res.statusCode);
  if (res.headers.location) {
    console.log('Redirecting to:', res.headers.location);
    https.get(res.headers.location, (redirRes) => {
      let body = '';
      redirRes.on('data', chunk => body += chunk);
      redirRes.on('end', () => console.log('Final response:', body));
    });
  }
});

req.on('error', (e) => console.error('Error:', e));
req.write(postData);
req.end();
