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

    test('instantiated Order has product, limit, size, side, status and valid properties', () => {
      expect(new Order()).toHaveProperty('id');
      expect(new Order()).toHaveProperty('product');
      expect(new Order()).toHaveProperty('limit', null);
      expect(new Order()).toHaveProperty('size');
      expect(new Order()).toHaveProperty('remaining');
      expect(new Order()).toHaveProperty('side');
      expect(new Order()).toHaveProperty('status');
      expect(new Order()).toHaveProperty('valid');
    });

    test('instantiated Orders have a null id to start with', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1
      });
      expect(order.id).toBeNull();
    });

    test('Orders will have a remaining property that is equal to the size supplied when order is instantiated', () => {
      const order = new Order({
        side: 'buy',
        size: 1,
        product: 'BTC_USD'
      });
      expect(order).toHaveProperty('remaining', 1);
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

    test('Order instance is not valid if product id is not well-formed', () => {
      const order = new Order({
        product: 'ETH/USD',
        side: 'buy',
        size: 1
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is not valid if side is not either buy or sell', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'create',
        size: 1
      });
      expect(order.valid).toBe(false);
    });

    test('Order instance is valid if all required params are supplied and if product string is well-formed', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1
      });
      expect(order.valid).toBe(true);
    });
    
    test('Order status will be set to created when required params are supplied and order is valid', () => {
      const order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1
      });
      expect(order.status).toBe('created');
    });
  });

  describe('Test setLimit()', () => {
    let order;
    beforeAll(() => {
      order = new Order({
        side: 'buy',
        size: '1.2',
        product: 'ETH-USD'
      });
    });
    test('Calling setLimit() with no arguments will throw a TypeError', () => {
      expect(() => order.setLimit()).toThrow(TypeError);
    });

    test('Calling setLimit() with an argument that is not a number will throw a TypeError', () => {
      expect(() => order.setLimit('700.11')).toThrow(TypeError);
      expect(() => order.setLimit([700.11])).toThrow(TypeError);
      expect(() => order.setLimit(true)).toThrow(TypeError);
      expect(() => order.setLimit({price: 700.11})).toThrow(TypeError);
    });
    
    test('Calling setLimit() with a number will set the order instance limit property to the passed in number value', () => {
      order.setLimit(711.11);
      expect(order.limit).toBe(711.11);
    });

    test('Calling setLimit() when there is already a number value set to the instance limit property will change the limit property value to the new number', () => {
      order.setLimit(712.13);
      order.setLimit(712.14);
      expect(order.limit).toBe(712.14);
    });

    test('Calling setLimit() successfully will return boolean true', () => {
      expect(order.setLimit(713.45)).toBe(true);
    });
  });

  describe('Test setId()', () => {
    let order;
    beforeAll(() => {
      order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1
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
      expect(order.setId('1234-5678-abcde')).toBe(true);
    });
  });

  describe('Test setStatus()', () => {

    let order;
    beforeAll(() => {
      order = new Order({
        product: 'ETH-USD',
        side: 'sell',
        size: 1     
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

    test('setStatus() throws if something other than created, placed, partial, filled, or cancelled is supplied to it', () => {
      expect(() => order.setStatus('deleted')).toThrow(TypeError);
    });

    test('order status is set on order if valid string is passed to setStatus()', () => {
      order.setStatus('partial');
      expect(order.status).toBe('partial');
    });

    test('setStatus() returns true if successfully executed', () => {
      expect(order.setStatus('filled')).toBe(true);
    });
  });

  describe('setRemaining functionality testing ...', () => {
    let order;
    beforeEach(() => {
      order = new Order({
        side: 'buy',
        size: 1,
        product: 'BTC-USD'
      });
    });
    test('setRemaining() will throw if nothing is passed to it', () => {
      expect(() => order.setRemaining()).toThrow(TypeError);
    });

    test('setRemaining() will throw if something other than a number is passed to it', () => {
      expect(() => order.setRemaining('23')).toThrow(TypeError);
      expect(() => order.setRemaining([23])).toThrow(TypeError);
    });
    
    test('setRemaining() will throw if a negative number is passed to it', () => {
      expect(() => order.setRemaining(-23)).toThrow(TypeError);
    });

    test('setRemaining() will update the remaining property if a valid positive number is supplied', () => {
      order.setRemaining(0.2343);
      expect(order.remaining).toEqual(0.2343);
    });

    test('setRemaining() will return the true if executed successfully', () => {
      expect(order.setRemaining(0.9382)).toBe(true);
    });
  });
});
