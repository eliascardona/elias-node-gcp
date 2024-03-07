const httpStatus = require('http-status-codes');

function sendError(res) {
  res.writeHead(httpStatus.StatusCodes.NOT_FOUND, {
    "Content-Type": "text/html"
  });

  const response = {
    status: res.statusCode,
    message: httpStatus.getStatusText(res.statusCode),
    headers: res.headers
  };

  const responseString = JSON.stringify(response, null, 2);
  
  res.write(`<pre>${responseString}</pre>`);
  res.end();
}

module.exports = sendError;
