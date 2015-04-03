var iframeClient = require('../lib/client');

describe('Client', function() {
  var client,
      document,
      iframe;

  describe('when it initialises', function() {

    beforeEach(function() {
      iframe = {};

      document = global.document = jasmine.createSpyObj('document', [
          'createElement'
      ]);

      document.body = jasmine.createSpyObj('body', [
          'appendChild'
      ]);

      document.createElement.and.returnValue(iframe);

      client = iframeClient.init('http://some-url');
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
  });
});
