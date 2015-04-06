var Promise = require('es6-promise').Promise,
    _ = require('lodash');

var channel = {
  init: function(sourceWindow, targetOrigin, targetWindow) {
    this.targetOrigin = targetOrigin;
    this.sourceWindow = sourceWindow;
    this.targetWindow = targetWindow;
    this.promises = _.create(null);

    this.lastMessageId = 0;

    onMessageReceived(sourceWindow, _.partial(processMessage, targetOrigin, this.promises));
  },

  send: function(data) {
    var self = this;
    var messagePromise = new Promise(function(resolve, reject) {
      self.promises[self.lastMessageId] = {
        resolve: resolve,
        reject: reject
      };
    });
    var request = {
      id: this.lastMessageId,
      data: data
    };

    this.targetWindow.postMessage(request, this.targetOrigin);

    this.lastMessageId += 1;
    return messagePromise;
  }
};

function onMessageReceived(window, callback) {
  if(window.attachEvent) {
    window.attachEvent('onmessage', function() {
      callback(window.event);
    });
    return;
  }

  window.addEventListener('message', callback, false);
}

function processMessage(targetOrigin, allPromises, event) {
  if(event.origin === targetOrigin && _.has(event.data, 'id')) {
    var message = event.data;

    if(_.has(allPromises, message.id)) {
      allPromises[message.id].resolve(event.data.data);
      delete allPromises[message.id];
      return;
    }

    var response = createResponse(message);
    event.source.postMessage(response, event.origin);
  }
}

function createResponse(message) {
  return {
    id: message.id,
    data: 'OK'
  };
}

module.exports = {
  create: function(options) {
    var d = _.create(channel);
    d.init(options.sourceWindow, options.targetOrigin, options.targetWindow);
    return d;
  }
};
