const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const _data = require('./lib/data');
const handlers = require('./lib/handlers')

const config = require('./config')

//HTTTP SERVER
const httpServer = http.createServer((req, res)=> {
  serverSetting(req,res)
});
httpServer.listen(config.httpPort, () => {
  console.log(`startin\` on port ${config.httpPort}, mode: ${config.envName}, protocol: http`)
});

// HTTTPS SERVER
const httpsOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pe')
}
const httpsServer = https.createServer(httpsOptions, (req, res)=> {
  serverSetting(req,res)
});
httpsServer.listen(config.httpsPort, () => {
  console.log(`startin\` on port ${config.httpsPort}, mode: ${config.envName}, protocol: https`)
});

// encapsulate non-changing server settings
const serverSetting = () => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const method = req.method.toLowerCase();
  const queryObject = parsedUrl.query
  const headers = req.headers
  const decoder = new StringDecoder('utf-8')
   buffer = '';  
  req.on('data', data => {
    buffer += decoder.write(data);
  })
  req.on('end', _ => {
    buffer += decoder.end();

    //choose the handler this request should go to
    const choosenHandler = router[trimmedPath] ? router[trimmedPath] : handlers.notFound;
    const data = {
      trimmedPath: trimmedPath,
      queryObject,
      method,
      headers,
      payload: JSON.parse(buffer),
    }

    choosenHandler(data, (statusCode = 200, payload = {}) => {
      const payloadString = JSON.stringify(payload)
      res.setHeader('Content-Type', 'Application/json')
      res.writeHead(statusCode);
      res.end(payloadString)
    });
  });
}

// ROUTER
const router = {
  sample: handlers.sample,
  users: handlers.users,
}