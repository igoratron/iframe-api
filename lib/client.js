module.exports = {
  init: function(url) {
    createIframe(url);
  }
};

function createIframe(url) {
  var iframe = document.createElement('iframe');
  iframe.src = url;

  document.body.appendChild(iframe);
}
