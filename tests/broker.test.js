const Broker = require('../src/broker');
const Exchange = require('../src/exchange');
const Order = require('../src/order');
const { WebsocketClient } = require('gdax');

describe('Broker class testing', () => {

  describe('Test Broker construction', () => {
    let broker;
    let exchange;
    let credentials;
    beforeEach(async () => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = await Exchange.build(credentials);
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
    let order, broker, exchange, credentials, processQueue;
    beforeEach(async () => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = await Exchange.build(credentials);
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

  describe('Test enableBroker() and disableBroker() functionality', () => {
    let credentials, exchange;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
    });
    test('running enable() will set the enable prop to true', () => {
      expect(exchange.broker.enable()).toBe(true);
      expect(exchange.broker.enabled).toBe(true);
    });

    test('running disable() will set the enable prop to false', () => {
      expect(exchange.broker.disable()).toBe(true);
      expect(exchange.broker.enabled).toBe(false);
    });
  });
});
