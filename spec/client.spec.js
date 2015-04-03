var iframeClient = require('../lib/client');

describe('Client', function() {
  var client,
      document,
      iframe;

  describe('when it initialises', function() {

    beforeEach(function() {
      iframe = {};

      iframe.contentWindow = jasmine.createSpyObj('window', [
          'postMessage'
      ]);

      document = global.document = jasmine.createSpyObj('document', [
          'createElement'
      ]);

      document.body = jasmine.createSpyObj('body', [
          'appendChild'
      ]);

      document.createElement.and.returnValue(iframe);

      client = iframeClient.init('http://some-url');
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('creates an iframe', function() {
      expect(document.createElement).toHaveBeenCalledWith('iframe');
    });

    it('loads the iframe from the given url', function() {
      expect(iframe.src).toBe('http://some-url');
    });

    it('attaches the iframe to the body element', function() {
      expect(document.body.appendChild).toHaveBeenCalledWith(iframe);
    });

    describe('when the iframe loads', function() {

      beforeEach(function(done) {
        iframe.onload();
        setImmediate(done);
      });

      it('sends a handshake to the iframe', function() {
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith('handshake');
      });
    });
  });
});

function setImmediate(callback) {
  setTimeout(function() {
    callback();
  }, 0);
}
