const Broker = require('../src/broker');

describe('Broker class testing', () => {

  describe('Test Broker construction', () => {

    test('instance of broker will be a child of the EventEmitter class', () => {
      const broker = new Broker();
      const {EventEmitter} = require('events');
      expect(broker instanceof EventEmitter);
    });

    test('instance of Broker class will have exchange and valid properties', () => {
      const broker = new Broker();
      expect(broker).toHaveProperty('exchange');
      expect(broker).toHaveProperty('valid');
    });

    test('instance of Broker class will not be valid if nothing is passed to it', () => {
      const broker = new Broker();
      expect(broker.valid).toBe(false);
    });

    test('instance of Broker class will be valid if exchange instance is passed to its constructor', () => {
      const Exchange = require('../src/exchange');
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      const exchange = new Exchange(credentials);
      const broker = new Broker(exchange);
      expect(broker.valid).toBe(true);
    });

    test('instances of Broker class are not valid if an invalid exchange instance is passed to the constructor', () => {
      const Exchange = require('../src/exchange');
      const credentials = {key: 'myKey'};
      const exchange = new Exchange(credentials);
      const broker = new Broker(exchange);
      expect(broker.valid).toBe(false);
    });
  });
});

