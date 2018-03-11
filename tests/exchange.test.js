const Exchange = require('../src/exchange');

describe('Test Exchange class', () => {
  describe('Test Exchange construction', () => {

    test('Exchange can be instantiated as an object', () => {
      expect(typeof new Exchange({}) === 'object').toBe(true);
    });

    test('instances of Exchange class inherit from EventEmitter', () => {
      const {EventEmitter} = require('events');
      const exchange = new Exchange({});
      expect(exchange instanceof EventEmitter).toBe(true);
    });

    test('instances of Exchange class have executor and valid properties', () => {
      expect(new Exchange({})).toHaveProperty('executor');
      expect(new Exchange({})).toHaveProperty('valid');
    });

    test('instances of Exchange are not valid if an executor is not passed to it', () => {
      const exchange = new Exchange({});
      expect(exchange.valid).toBe(false);
    });

    test('instances of Exchange are not valid if supplied executor does not have all authentication props', () => {
      const Gdax = require('gdax');
      const executor = new Gdax.AuthenticatedClient(key='myKey');
      const exchange = new Exchange({executor});
      expect(exchange.valid).toBe(false);
    });

    test('instances of Exchange are valid if supplied executor has all authentication props', () => {
      const Gdax = require('gdax');
      const executor = new Gdax.AuthenticatedClient(key='myKey', secret='mySecret', passphrase='myPassphrase');
      const exchange = new Exchange({executor});
      expect(exchange.valid).toBe(true);
    });
  });

  // describe('Test executor order status calls', () => {

  // });
});
