var port = 3000;
var AWSXRay = require('aws-xray-sdk');
var logger = {
  error: (message, meta) => { console.error(message, meta) },
  warn: (message, meta) => { console.warn(message, meta) },
  info: (message, meta) => { console.info(message, meta)  },
  debug: (message, meta) => { console.debug(message, meta)  }
}
AWSXRay.setLogger(logger);

const express = require('express');

const app = express();

app.use(AWSXRay.express.openSegment('MyApp'));
AWSXRay.captureHTTPsGlobal(require('https'));
const http = require('https');


app.get('/', function (req, res) {
  var host = 'google.com';

  AWSXRay.captureAsyncFunc('send', function(subsegment) {
    sendRequest(host, function() {
      console.log('rendering!');
      res.render('index');
      subsegment.close();
    });
  });
});

app.use(AWSXRay.express.closeSegment());

function sendRequest(host, cb) {
  var options = {
    host: host,
    path: '/',
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      cb();
    });
  }

  http.request(options, callback).end();
};

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
