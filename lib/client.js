var Promise = require('es6-promise').Promise,
    _ = require('lodash');

module.exports = {
  init: function(url, options) {
    createIframe(url, options.origin)
        .then(sendHandshake)
        .then(undefined, errorHandler);
  }
};

function createIframe(url, origin) {
  var iframe = document.createElement('iframe');
  iframe.src = url;

  var iframeLoaded = new Promise(function(resolve, reject) {
    try {
      onIframeLoad(iframe, function() {
        resolve({
          send: bindPostMessage(iframe, origin)
        })
      });
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

function bindPostMessage(iframe, origin) {
  return _.chain(iframe.contentWindow.postMessage)
          .bind(iframe.contentWindow)
          .rearg(1, 0, 2)
          .partial(origin)
          .value();
}

function sendHandshake(channel) {
  channel.send('handshake');
}

function errorHandler(error) {
  console.error(error.stack);
}
