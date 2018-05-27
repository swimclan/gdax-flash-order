const Broker = require('../src/broker');
const Exchange = require('../src/exchange');
const Order = require('../src/order');
const { WebsocketClient } = require('gdax');

describe('Broker class testing', () => {

  describe('Test Broker construction', () => {
    let broker;
    let exchange;
    let credentials;
    beforeEach(() => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = new Exchange(credentials);
      broker = new Broker(exchange);
    });
    test('instance of broker will be a child of the EventEmitter class', () => {
      const {EventEmitter} = require('events');
      expect(broker instanceof EventEmitter);
    });

    test('instance of Broker class will have exchange, order queue and valid properties', () => {
      expect(broker).toHaveProperty('enabled', false);
      expect(broker).toHaveProperty('queue', []);
      expect(broker).toHaveProperty('exchange');
      expect(broker).toHaveProperty('valid');
    });

    test('initialized broker instance order queue will initialize as an array of length 0', () => {
      expect(Array.isArray(broker.queue)).toBe(true);
      expect(broker.queue.length).toBe(0);
    })

    test('instance of Broker class will not be valid if nothing is passed to it', () => {
      const invalidBroker = new Broker();
      expect(invalidBroker.valid).toBe(false);
    });

    test('instance of Broker class will be valid if exchange instance is passed to its constructor', () => {
      expect(broker.valid).toBe(true);
    });

    test('instances of Broker class are not valid if an invalid exchange instance is passed to the constructor', () => {
      const Exchange = require('../src/exchange');
      const invalidCredentials = {key: 'myKey'};
      const invalidExchange = new Exchange(invalidCredentials);
      const invalidBroker = new Broker(invalidExchange);
      expect(invalidBroker.valid).toBe(false);
    });
  });

  describe('Test queueOrder() functionality', () => {
    let order;
    let broker;
    let exchange;
    let credentials;
    beforeEach(() => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = new Exchange(credentials);
      broker = new Broker(exchange);
      order = new Order({
        product: 'ETH-USD',
        side: 'buy',
        size: 1,
        market: false,
        limit: 700.00
      });
    });
    test('queueOrder() will throw TypeError if nothing is passed in', () => {
      expect(() => broker.queueOrder()).toThrow(TypeError);
    });

    test('queueOrder() will throw TypeError if an invalid order instance is passed in', () => {
      const invalidOrder = new Order({ product: 'ETH-USD' });
      expect(() => broker.queueOrder(invalidOrder)).toThrow(TypeError);
    });

    test('queueOrder() will throw if anything other than an instance of Order type is passed in', () => {
      expect(() => broker.queueOrder(['ETH-USD'])).toThrow(TypeError);
      expect(() => broker.queueOrder('ETH-USD')).toThrow(TypeError);
      expect(() => broker.queueOrder(1200)).toThrow(TypeError);
    });

    test('If a valid order is passed into queueOrder() the order queue length will increase by 1', () => {
      const prevQueueSize = broker.queue.length;
      broker.queueOrder(order);
      expect(broker.queue.length - prevQueueSize).toBe(1);
    });

    test('If a valid order is passed into queueOrder() it will be the appended to the end of the order queue', () => {
      broker.queueOrder(order);
      expect(broker.queue[broker.queue.length-1]).toBe(order);
    });

    test('If a valid order is passed into queueOrder() it will be returned by the function', () => {
      expect(broker.queueOrder(order)).toBe(order);
    });

    test('If the broker is not enabled when a valid order is passed to queueOrder() then the broker will be enabled', () => {
      broker.queueOrder(order);
      expect(broker.enabled).toBe(true);
    });
  });

  describe('_enableBroker() and disableBroker() functionality', () => {
    beforeEach(() => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = new Exchange(credentials);
    });
    test('running _enableBroker() will set the enable prop to true', () => {
      expect(exchange.broker._enableBroker()).toBe(true);
      expect(exchange.broker.enabled).toBe(true);
    });

    test('running _disableBroker() will set the enable prop to false', () => {
      expect(exchange.broker._disableBroker()).toBe(true);
      expect(exchange.broker.enabled).toBe(false);
    });
  });

  describe('Test _processQueue() functionality', () => {
    let credentials, exchange, broker, order;
    beforeEach(() => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = new Exchange(credentials);
      exchange.broker.queueOrder(new Order({ product: 'ETH-USD', size: 1, market: false, limit: 770.23, side: 'buy' }));
      exchange.broker.queueOrder(new Order({ product: 'BTC-USD', size: 0.2, market: true, side: 'buy' }));
    });
    test('_processQueue() will return false and not run if broker is not enabled', () => {
      exchange.broker._disableBroker();
      expect(exchange.broker._processQueue()).toBe(false);
      expect(exchange.feeds.length).toBe(0);
    });
    
    test('_processQueue() will iterate over queue and load a feed for orders in a \'created\' state', () => {
      const order = new Order({ product: 'ETH-BTC', size: 1, market: true, side: 'buy' });
      order.setStatus('placed');
      exchange.broker.queueOrder(order);
      exchange.broker._processQueue();
      expect(exchange.feeds['ETH-USD']).toBeDefined();
      expect(exchange.feeds['ETH-USD'] instanceof WebsocketClient).toBe(true);
      expect(exchange.feeds['BTC-USD']).toBeDefined();
      expect(exchange.feeds['BTC-USD'] instanceof WebsocketClient).toBe(true);
      expect(exchange.feeds['ETH-BTC']).not.toBeDefined();
      expect(exchange.feeds['BCH-USD']).not.toBeDefined();
    });
  });
});

