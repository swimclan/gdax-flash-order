const Order = require('../src/order');

describe('Test Order class', () => {
  describe('Test Order construction', () => {

    test('Order class can be instantiated', () => {
      expect(typeof new Order()).toBe('object');
    });

    test('Order class is a sub class of Event Emitter', () => {
      const {EventEmitter} = require('events');
      const order = new Order({});
      expect(order instanceof EventEmitter).toBe(true);
    });

    test('instantiated Order has product, limit, market, size, side, and valid properties', () => {
      expect(new Order()).toHaveProperty('id');
      expect(new Order()).toHaveProperty('product');
      expect(new Order()).toHaveProperty('limit');
      expect(new Order()).toHaveProperty('market');
      expect(new Order()).toHaveProperty('size');
      expect(new Order()).toHaveProperty('side');
      expect(new Order()).toHaveProperty('valid');
    });

    test('instantiated Orders have a null id to start with', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1,
        market: true
      });
      expect(order.id).toBeNull();
    });

    test('Order instance is not valid if product, size, and side are not supplied', () => {
      const order1 = new Order({});
      expect(order1.valid).toBe(false);

      const order2 = new Order({product: 'ETH-USD'});
      expect(order2.valid).toBe(false);

      const order3 = new Order({product: 'ETH-USD', side: 'buy'});
      expect(order3.valid).toBe(false);

      const order4 = new Order({product: 'ETH-USD', size: 1});
      expect(order4.valid).toBe(false);

      const order5 = new Order({size: 1, side: 'buy'});
      expect(order5.valid).toBe(false);
    });

    test('Order instance is not valid if either market or limit is not supplied', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'buy',
        size: 1
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is not valid if both market or limit are supplied', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'buy',
        size: 1,
        market: true,
        limit: 700.00
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is not valid if product id is not well-formed', () => {
      const order = new Order({
        product: 'ETH/USD',
        side: 'buy',
        size: 1,
        market: true
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is not valid if side is not either buy or sell', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'create',
        size: 1,
        market: true
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is valid if all required params are supplied and if product string is well-formed', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1,
        limit: 770.00
      });
      expect(order.valid).toBe(true);
    })
  });
});
