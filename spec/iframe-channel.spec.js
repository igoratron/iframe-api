var iframeChannel = require('../lib/iframe-channel'),
    _ = require('lodash');

describe('when iframe channel is created', function() {

  var channel,
      sourceWindow,
      targetWindow;

  beforeEach(function() {
    sourceWindow = createSpyWindow();
    targetWindow = createSpyWindow();

    channel = iframeChannel.create({
      sourceWindow: sourceWindow,
      targetOrigin: 'http://some-origin',
      targetWindow: targetWindow
    });
  });

  it('starts listening for messages on its own window', function() {
    expect(sourceWindow.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
  });

  describe('on ie8', function() {

    beforeEach(function() {
      sourceWindow.attachEvent = jasmine.createSpy();
      iframeChannel.create({
        sourceWindow: sourceWindow,
        targetOrigin: 'http://some-origin',
        targetWindow: targetWindow
      });
    });

    it('starts listening for messages on its own window', function() {
      expect(sourceWindow.attachEvent).toHaveBeenCalledWith('onmessage', jasmine.any(Function));
    });
  });

  describe('when you send a message', function() {
    var result;

    beforeEach(function() {
      result = channel.send('some data');
    });

    it('returns a promise', function() {
      expect(result.then).toBeDefined();
    });

    it('sends a request to the other window with an id', function() {
      var expectedMessage = {
        id: 0,
        data: 'some data'
      };
      expect(targetWindow.postMessage).toHaveBeenCalledWith(expectedMessage, 'http://some-origin');
    });

    describe('when a next message is sent', function() {

      beforeEach(function() {
        result = channel.send('some other data');
      });

      it('sends a request to the other window with an incremented id', function() {
        var expectedMessage = {
          id: 1,
          data: 'some other data'
        };
        expect(targetWindow.postMessage).toHaveBeenCalledWith(expectedMessage, 'http://some-origin');
      });
    });

    describe('when a message is received', function() {

      describe('and it is a response to a previous call', function() {

        var successHandler;

        beforeEach(function(done) {
          successHandler = jasmine.createSpy();
          result.then(successHandler);

          sourceWindow.trigger('message', {
            origin: 'http://some-origin',
            source: sourceWindow,
            data: {
              id: 0,
              data: 'OK'
            }
          })
          setTimeout(done, 0);
        });

        it('resolves the promise with the data', function() {
          expect(successHandler).toHaveBeenCalledWith('OK');
        });

        it('removes the promise from the list of promises', function() {
          expect(_.has(channel.promises, '0')).toBe(false);
        });
      });
    });
  });

  describe('when a message is received', function() {

    describe('and it is not a response to a previous call', function() {

      describe('and the origin matches the expected origin', function() {

        beforeEach(function() {
          sourceWindow.trigger('message', {
            origin: 'http://some-origin',
            source: sourceWindow,
            data: {
              id: 0,
              data: 'OK'
            }
          })
        });

        it('sends a response when the origin of the message matches the expected origin', function() {
          expect(sourceWindow.postMessage).toHaveBeenCalledWith({ id: 0, data: 'OK'}, 'http://some-origin');
        });
      });

      describe('and the origin doesn\'t matche the expected origin', function() {

        beforeEach(function() {
          sourceWindow.trigger('message', {
            origin: 'http://some-malicious-origin'
          })
        });

        it('does nothing', function() {
          expect(sourceWindow.postMessage).not.toHaveBeenCalled();
        });
      });

      describe('and it has the right origin but doesn\'t have an id', function() {

        beforeEach(function() {
          sourceWindow.trigger('message', {
            origin: 'http://some-origin'
          })
        });

        it('does nothing', function() {
          expect(sourceWindow.postMessage).not.toHaveBeenCalled();
        });
      });
    });
  });
});

function createSpyWindow() {
  var fakeWindow = jasmine.createSpyObj('window', [
      'postMessage',
      'addEventListener'
  ]);

  var eventHandlers = _.create(null);

  fakeWindow.addEventListener.and.callFake(function(event, callback) {
    eventHandlers[event] = callback;
  });

  fakeWindow.trigger = function(event, data) {
    eventHandlers[event](data);
  };

  return fakeWindow;
}
