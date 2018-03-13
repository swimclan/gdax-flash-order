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

    test('instantiated Order has product, limit, market, size, side, status and valid properties', () => {
      expect(new Order()).toHaveProperty('id');
      expect(new Order()).toHaveProperty('product');
      expect(new Order()).toHaveProperty('limit');
      expect(new Order()).toHaveProperty('market');
      expect(new Order()).toHaveProperty('size');
      expect(new Order()).toHaveProperty('side');
      expect(new Order()).toHaveProperty('status');
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
    });
    
    test('Order status will be set to created when required params are supplied and order is valid', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1,
        limit: 770.00
      });
      expect(order.status).toBe('created');
    });
  });

  describe('Test setId()', () => {
    let order;
    beforeAll(() => {
      order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1,
        limit: 770.00
      });
    });
    test('setId() throws if nothing is passed to it', () => {
      expect(() => order.setId()).toThrow(TypeError);
    });

    test('setId() throws if a null is passed to it', () => {
      expect(() => order.setId(null)).toThrow(TypeError);
    });

    test('setId() throws if a number is passed to it', () => {
      expect(() => order.setId(123)).toThrow(TypeError);
    });

    test('setId() throws if an object is passed to it', () => {
      expect(() => order.setId({id: '123-456-678'})).toThrow(TypeError);
    });

    test('setId() throws if an array is passed to it', () => {
      expect(() => order.setId([123, 345, 567])).toThrow(TypeError);
    });

    test('setId() throws if a boolean is passed to it', () => {
      expect(() => order.setId(true)).toThrow(TypeError);
    });

    test('invoke setId() to assign a new id to the order instance', () => {
      order.setId('1234-5678-abcde');
      expect(order.id).toBe('1234-5678-abcde');
    });

    test('setId() returns a string representing the newly assigned order id', () => {
      expect(order.setId('1234-5678-abcde')).toBe('1234-5678-abcde');
    });
  });

  describe('Test setStatus()', () => {

    let order;
    beforeAll(() => {
      order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1,
        limit: 770.00        
      });
    });

    test('setStatus() throws if nothing is passed to it', () => {
      expect(() => order.setStatus()).toThrow(TypeError);
    });

    test('setStatus() throws if an object is passed to it', () => {
      expect(() => order.setStatus({status: 'created'})).toThrow(TypeError);
    });

    test('setStatus() throws if an array is passed to it', () => {
      expect(() => order.setStatus(['created'])).toThrow(TypeError);
    });

    test('setStatus() throws if a number is passed to it', () => {
      expect(() => order.setStatus(0)).toThrow(TypeError);
    });

    test('setStatus() throws if a boolean is passed to it', () => {
      expect(() => order.setStatus(true)).toThrow(TypeError);
    });

    test('setStatus() throws if something other than created, placed, filled, or cancelled is supplied to it', () => {
      expect(() => order.setStatus('deleted')).toThrow(TypeError);
    });

    test('order status is set on order if valid string is passed to setStatus()', () => {
      order.setStatus('filled');
      expect(order.status).toBe('filled');
    });
  });
});
