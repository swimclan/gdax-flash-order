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

  describe('Test Exchange getOrder() calls', () => {
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

  describe('Test Exchange placeOrder() calls', () => {
    let exchange, validOrder, invalidOrder;
    beforeAll(() => {
      const Gdax = require('gdax');
      const Order = require('../src/order');
      const executor = new Gdax.AuthenticatedClient(key='myKey', secret='mySecret', passphrase='myPassphrase');
      exchange = new Exchange({executor});
      validMarketOrder = new Order({
        product: 'BTC-USD',
        side: 'buy',
        size: 1,
        market: true
      });
      validLimitOrder = new Order({
        product: 'BTC-USD',
        side: 'buy',
        size: 1,
        limit: 707.43
      });
      invalidOrder = new Order({
        product: 'BCH-USD',
        side: 'neutral',
        limit: 998.50
      });
    });

    test('placeOrder() call will return a rejected promise if a string is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder('BCH-USD 709.11 1.00 buy').then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() call will return a rejected promise if an array is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder(['BCH-USD', 1.00, 709.11, 'buy']).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() call will return a rejected promise if a plain object is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder({side: 'buy', size: 1, product: 'BCH-USD'}).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() call will return a rejected promise if a boolean is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder(false).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() call will return a rejected promise if a number is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder(1234363).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() call will return a rejected promise if an invalid Order instance is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder(invalidOrder).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() will return a resolved promise if a valid market order is passed to it', () => {
      expect.assertions(3);
      const failure = jest.fn();
      exchange.placeOrder(validMarketOrder).then((order) => {
        expect(typeof order).toBe('object');
        expect(order.type).toBe('market');
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() will return a resolved promise if a valid limit order is passed to it', () => {
      expect.assertions(3);
      const failure = jest.fn();
      exchange.placeOrder(validLimitOrder).then((order) => {
        expect(typeof order).toBe('object');
        expect(order.type).toBe('limit');
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() will return a rejected promise if an error occurs during the async operation (ie no connection)', () => {
      const Gdax = require('gdax');
      const executor = new Gdax.AuthenticatedClient(key='myKey', secret='mySecret', passphrase='myPassphrase');
      executor._connection(false); // simulate internet connection failure
      downExchange = new Exchange({executor});
      const success = jest.fn();
      expect.assertions(2);
      downExchange.placeOrder(validLimitOrder).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Test exchange cancelOrder() calls', () => {
    let exchange, Order, invalidOrder, validOrderWithId, validOrderNullId, anotherValidOrderWithId, unknownOrderWithId;
    beforeAll(() => {
      const Gdax = require('gdax');
      Order = require('../src/order');
      executor = new Gdax.AuthenticatedClient(key='myKey', secret='mySecret', passphrase='myPassphrase');
      exchange = new Exchange({executor});
      invalidOrder = new Order({
        size: 1,
        side: 'buy',
        limit: 798.32
      });
      validOrderWithId = new Order({
        size: 1,
        side: 'buy',
        limit: 798.32,
        product: 'ETH-USD'
      });
      anotherValidOrderWithId = new Order({
        size: 2.3,
        side: 'sell',
        limit: 711.09,
        product: 'ETH-USD'
      });
      validOrderNullId = new Order({
        size: 1,
        side: 'buy',
        limit: 798.32,
        product: 'ETH-USD'
      });
      unknownOrderWithId = new Order({
        size: 1,
        side: 'buy',
        limit: 798.32,
        product: 'ETH-USD'
      });
    
      validOrderWithId.setId('68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08');
      anotherValidOrderWithId.setId('d0c5340b-6d6c-49d9-b567-48c4bfca13d2');
      unknownOrderWithId.setId('h4837hf7-19nv-7722-of38-jfq9n2js0knv');
    });

    test('cancelOrder() calls will return rejected promise if a string is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder('68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08').then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() calls will return rejected promise if an array is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(['68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08']).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if a number is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(23948234985).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if a plain object is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder({orderId: '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08'}).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if a boolean is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(true).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if an invalid order instance is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(invalidOrder).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if an order with an unknown orderId is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(unknownOrderWithId).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise if an order instance with a null id is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.cancelOrder(validOrderNullId).then((orders) => {
        success(orders);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a resolved promise with an array of a single orderId if a valid order instance with a known orderId is passed to it', () => {
      expect.assertions(3);
      const failure = jest.fn();
      exchange.cancelOrder(validOrderWithId).then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length).toBe(1);
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });

    test('cancelOrder() will return a rejected promise, if the same order id appears on multiple cancelled orders', () => {
      expect.assertions(2);
      const failure = jest.fn();
      exchange.cancelOrder(anotherValidOrderWithId).then((orders) => {
        expect(Array.isArray(orders) && orders.length === 1).toBe(true);
        const dupOrder = new Order({
          side: 'buy',
          size: '3.2',
          product: 'BCH-USD',
          market: true
        });
        dupOrder.setId(orders[0]);
        return exchange.cancelOrder(dupOrder);
      }).catch((err) => {
        failure(err);
      }).then((orders) => {
        expect(failure).toHaveBeenCalledTimes(1);
      });
    });
  });
});
