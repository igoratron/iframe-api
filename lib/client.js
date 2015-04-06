var Promise = require('es6-promise').Promise,
    iframeChannel = require('./iframe-channel'),
    _ = require('lodash');

module.exports = {
  init: function(url, options) {
    createIframe(url)
        .then(function(iframe) {
          return iframeChannel.create({
            origin: 'http://localhost:8000',
            sourceWindow: window,
            targetWindow: iframe.contentWindow
          });
        })
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

function sendHandshake(channel) {
  channel
      .send('handshake')
      .then(function(response) {
        console.log('promise', response);
      })
  ;
}

function errorHandler(error) {
  console.error(error.stack);
}
