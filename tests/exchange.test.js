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

  describe('Test executor getOrder() calls', () => {
    let exchange, knownOrder, unknownOrder, validOrder, invalidOrder;
    beforeAll(() => {
      const Gdax = require('gdax');
      const Order = require('../src/order');
      const executor = new Gdax.AuthenticatedClient(key='myKey', secret='mySecret', passphrase='myPassphrase');
      exchange = new Exchange({executor});
      knownOrder = new Order({
        product: 'BTC-USD',
        side: 'buy',
        size: 1,
        market: true
      });
      unknownOrder = new Order({
        product: 'BCH-USD',
        side: 'sell',
        size: 2,
        limit: 998.50
      });
      invalidOrder = new Order({
        product: 'BCH-USD',
        side: 'neutral',
        limit: 998.50
      });
      knownOrder.setId('68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08');
      unknownOrder.setId('1234-invalid-4678');
    });

    test('getOrder() call will return a rejected promise if a string is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder('1234-4567-5678').then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return a rejected promise if a number is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder(12344567567).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return a rejected promise if an array is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder([1234, 3456, 4567]).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return a rejected promise if a boolean is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder(true).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return a rejected promise if a plain object is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder({id: '123-456-567'}).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() will return a rejected promise if an invalid order instance is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.getOrder(invalidOrder).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return rejected promise with an error object if a valid order with an unknown order id is passed to it', () => {
      expect.assertions(2);
      let success = jest.fn();
      exchange.getOrder(unknownOrder).then((order) => {
        success(data);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('getOrder() call will return resolved promise with the order data object if a valid order with known order id is passed to it', () => {
      expect.assertions(3);
      let failure = jest.fn();
      exchange.getOrder(knownOrder).then((order) => {
        expect(typeof order).toBe('object');
        expect(order.id).toBe('68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08');
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });
  });
});
