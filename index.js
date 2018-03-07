var _getType = (o) => {
  var r = /^\[object\s(.*)\]$/;
  return {}.toString.call(o).match(r)[1].toLowerCase();
};

var json2param = (params, encode) => {
  var ret = [];
  Object.keys(params).forEach((key, i) => {
      ret.push(key + '=' + encodeURIComponent(params[key]));
  })
  return ret.join('&');
}

export default (url, options) => {
  var request = new XMLHttpRequest();
  options = options || {};
  var method = options.method || 'GET';
  method = method.toUpperCase();
  var params = options.data;
  var paramsType = _getType(params) ;
  var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers
  }

  // just delete the Content-Type if the params is FormData
  if (paramsType === 'formdata') {
      delete headers['Content-Type'];
  }

  if (paramsType === 'object') {
      params = json2param(params);
      if (method === 'GET' && params) {
          url += '?' + params;
          params = null;
      }
  }

  request.open(method, url);

  // set headers
  Object.keys(headers).forEach((key, i) => {
      request.setRequestHeader(key, headers[key]);
  })

  
  

  return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
          var res;
          var contentType;
          if (request.readyState == 4 ) {
              contentType = request.getResponseHeader('Content-Type');
              res = request.responseText;
              if (request.status.toString().indexOf('2') === 0) {
                  if (contentType.indexOf('application/json') >= 0) {
                      res = JSON.parse(res);
                      if (res.code === 200) {
                          resolve(res);
                      } else {
                          reject(res);
                      }
                  } else {
                      resolve(res);
                  }
              } else {
                  try {
                      res = JSON.parse(request.responseText);
                  } catch (e) {}
                  reject(res);
              }
          }
      }
      request.send(params);
  })
}