var iframeClient = require('../lib/client'),
    jsdom = require('jsdom').jsdom;

describe('Client', function() {
  var client,
      document,
      iframe;

  describe('when it initialises', function() {

    beforeEach(function() {
      document = global.document = jsdom();

      client = iframeClient.init('http://some-url');
      iframe = document.querySelector('iframe');
      iframe.contentWindow.postMessage = jasmine.createSpy();
    });

    it('creates an iframe', function() {
      expect(iframe).toBeDefined();
    });

    it('loads the iframe from the given url', function() {
      expect(iframe.src).toBe('http://some-url');
    });

    describe('when the iframe loads', function() {

      beforeEach(function(done) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('load', true, true);
        iframe.dispatchEvent(event);
        setTimeout(done, 0);
      });

      it('sends a handshake to the iframe', function() {
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith('handshake');
      });
    });
  });
});
