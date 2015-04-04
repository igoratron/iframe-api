var Promise = require('es6-promise').Promise;

module.exports = {
  init: function(url) {
    createIframe(url)
        .then(sendHandshake)
        .then(undefined, errorHandler);
  }
};

function createIframe(url) {
  var iframe = document.createElement('iframe');
  iframe.src = url;

  var iframeLoaded = new Promise(function(resolve, reject) {
    try {
      onIframeLoad(iframe, resolve.bind(null, iframe));
    } catch (ex) {
      reject(ex);
    }
  });

  document.body.appendChild(iframe);

  return iframeLoaded;
}

function onIframeLoad(iframe, callback) {
  if (iframe.attachEvent){
    iframe.attachEvent('onload', callback);
  } else {
    iframe.addEventListener('load', callback, false);
  }
}

function sendHandshake(iframe) {
  send(iframe, 'handshake');
}

function send(iframe, data) {
  iframe.contentWindow.postMessage(data);
}

function errorHandler(error) {
  console.error(error.toString());
  console.error(error.stack);
}
