var Promise = require('es6-promise').Promise,
    _ = require('lodash');

module.exports = {
  init: function(url, options) {
    createIframe(url)
        .then(_.partial(bindPostMessage, options.origin))
        .then(sendHandshake)
        .then(undefined, errorHandler);
  }
};

function createIframe(url) {
  var iframe = document.createElement('iframe');
  iframe.src = url;

  var iframeLoaded = new Promise(function(resolve, reject) {
    try {
      onIframeLoad(iframe, _.partial(resolve, iframe));
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
    return;
  }

  iframe.addEventListener('load', callback, false);
}

function bindPostMessage(origin, iframe) {
  return _.chain(iframe.contentWindow.postMessage)
          .bind(iframe.contentWindow)
          .rearg(1, 0, 2)
          .partial(origin)
          .value();
}

function sendHandshake(send) {
  send('handshake');
}

function errorHandler(error) {
  console.error(error.stack);
}
