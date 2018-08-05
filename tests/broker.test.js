const Broker = require('../src/broker');
const Exchange = require('../src/exchange');
const Order = require('../src/order');
const Engine = require('../src/engine');
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
      expect(broker).toHaveProperty('engine');
      expect(broker).toHaveProperty('valid');
    });

    test('initialized broker will have an Engine instance assigned to its engine property', () => {
      expect(broker.engine instanceof Engine).toBe(true);
    });

    test('initialized broker will have the assigned engine set to 20ms timing', () => {
      expect(broker.engine.timing).toBe(20);
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

    test('If the broker is not enabled when a valid order is passed to queueOrder() and default silent option is left false, then the broker will be enabled', () => {
      broker.queueOrder(order);
      expect(broker.enabled).toBe(true);
    });

    test('If the silent option is set to true, queueOrder() will not enable the broker', () => {
      broker.queueOrder(order, true);
      expect(broker.enabled).toBe(false);
    });
  });

  describe('Test _processQueue() functionality ...', () => {
    let exchange, credentials, broker;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
    });
    test('_processQueue() will call _dispatchFilledOrderHandler()', async () => {
      const exchange = await Exchange.build(credentials);
      const broker = new Broker(exchange);
      const dispatchHandler = jest.spyOn(broker, '_dispatchFilledOrderHandler');
      broker._processQueue();
      expect(dispatchHandler).toHaveBeenCalledTimes(1);
    });
    test('_processQueue() will start the broker engine', async () => {
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      const engineStart = jest.spyOn(broker.engine, 'start');
      broker._processQueue();
      expect(engineStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test _checkFilled() functionality', () => {
    let exchange, credentials, broker, order;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      order = new Order({ side: 'buy', product: 'BTC-USD', size: 1 });
      order.setStatus('placed');
      order.setLimit(6534.23);
      order.setId('d50ec984-77a8-460a-b958-66f114b0de9b');
    });
    test('_checkFilled() will not change the queued order\'s status if the data.type of the incoming message is not \'match\'', () => {
      broker.queueOrder(order, true);
      const open = {
          type: 'open',
          time: '2018-11-07T08:19:27.028459Z',
          product_id: 'BTC-USD',
          sequence: 10,
          order_id: 'd50ec984-77a8-460a-b958-66f114b0de9b',
          price: '200.2',
          remaining_size: '1.00',
          side: 'sell'
        }
      broker._checkFilled(open);
      expect(order).toHaveProperty('status', 'placed');
    });
    test('_checkFilled() will set the queued order\'s status to \'filled\' if the incoming message is \'match\' with a size equivalent to the remaining order size', () => {
      broker.queueOrder(order, true);
      const matched = {
        "type": "match",
        "trade_id": 10,
        "sequence": 50,
        "maker_order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
        "time": "2018-11-07T08:19:27.028459Z",
        "product_id": "BTC-USD",
        "size": 1,
        "price": "400.23",
        "side": "sell"
    }
      broker._checkFilled(matched);
      expect(order).toHaveProperty('status', 'filled');
    });

    test('_checkFilled() set the queued order\'s status to \'partial\' if the incoming match message size is less than the remaining size of the order', () => {
      broker.queueOrder(order, true);
      const message = {
        "type": "match",
        "trade_id": 10,
        "sequence": 50,
        "maker_order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
        "time": "2014-11-07T08:19:27.028459Z",
        "product_id": "BTC-USD",
        "size": "0.12324",
        "price": "400.23",
        "side": "sell"
      };
      broker._checkFilled(message);
      expect(order).toHaveProperty('status', 'partial');
    });
  });

  describe('_dispatchFilledOrderHandler() functionality ...', () => {
    let exchange, credentials, broker, order;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      order = new Order({ side: 'buy', size: 1, product: 'BTC-USD' });
      order.setLimit(6534.77);
    });
    test('_dispatchFilledOrderHandler() will execute _checkFilled() when messages from exchange feeds that are of type \'match\' are received', async (done) => {
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      const checkFilled = jest.spyOn(broker, '_checkFilled');
      broker._dispatchFilledOrderHandler();
      setTimeout(() => {
        expect(checkFilled).toHaveBeenCalledTimes(1);
        done();
      }, 400);
    });
  });

  describe('placeOrders() functionality ...', async () => {
    let exchange, broker, credentials, orders, snapshot, l2update;
    beforeEach(async () => {
      credentials = { key: 'myKey', passphrase: 'myPassphrase', secret: 'mySecret' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      orders = [
        new Order({ side: 'buy', size: 1, product: 'ETH-USD' }),
        new Order({ side: 'buy', size: 1, product: 'BTC-USD' }),
        new Order({ side: 'buy', size: 1, product: 'BCH-USD' })
      ];
      snapshot = (product) => ({
        "type": "snapshot",
        "product_id": product,
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]],
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2.000435"], ["6500.09", "0.04"]]
      });
      l2update = (product) => ({
        "type": "l2update",
        "product_id": product,
        "changes": [
          ['buy', '6500.04', '1.02305'],
          ['sell', '6500.13', '0.999913'],
          ['sell', '6500.14', '2.049383'],
          ['buy', '6500.09', '0']
        ]
      });
    });
    test('When placeOrders() is called, placeOrder() on the exchange will be called for each order in a \'created\' or \'cancelled\' status', async () => {
      const exchange = await Exchange.build(credentials);
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      const placeOrder = jest.spyOn(exchange, 'placeOrder');
      const broker = new Broker(exchange);
      orders[0].setStatus('cancelled');
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      expect(placeOrder).toHaveBeenCalledTimes(3);
    });

    test('When placeOrders() is called all queued orders in a \'created\' or \'cancelled\' state will get a new id and their status set to \'placed\'', async () => {
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders[0].setStatus('cancelled');
      orders.forEach(order => broker.queueOrder(order, true));      
      await broker.placeOrders();
      expect(broker.queue.every(order => typeof order.id === 'string' && order.status === 'placed')).toBe(true);
    });

    test('placeOrders() will return an array of placed orders upon successful execution', async () => {
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      const placedOrders = await broker.placeOrders();
      expect(Array.isArray(placedOrders)).toBe(true);
      expect(placedOrders.length).toBe(3);
      expect(placedOrders.every(order => order instanceof Order)).toBe(true);
    });

    test('placeOrders() will return a rejected promise with an error object if an unknown error occurs in the exchange', (done) => {
      expect.assertions(2);
      const success = jest.fn();
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      exchange.executor.connected = false; // simulate connection failure at upstream executor (gdax)
      broker.placeOrders().then((placedOrders) => {
        success(placedOrders);
      }).catch((e) => {
        expect(e).not.toBeNull();
        expect(success).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });

  describe('Test cancelOrders() functionality ...', () => {
    let exchange, broker, credentials, orders, snapshot, l2update;
    beforeEach(async () => {
      credentials = { key: 'myKey', passphrase: 'myPassphrase', secret: 'mySecret' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      orders = [
        new Order({ side: 'buy', size: 1, product: 'BTC-USD' }),
        new Order({ side: 'buy', size: 1, product: 'ETH-USD' }),
        new Order({ side: 'sell', size: 1, product: 'BCH-USD' })
      ];
      snapshot = (product) => ({
        "type": "snapshot",
        "product_id": product,
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]],
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2.000435"], ["6500.09", "0.04"]]
      });
      l2update = (product) => ({
        "type": "l2update",
        "product_id": product,
        "changes": [
          ['buy', '6500.04', '1.02305'],
          ['sell', '6500.13', '0.999913'],
          ['sell', '6500.14', '2.049383'],
          ['buy', '6500.09', '0']
        ]
      });
    });
    test('When cancelOrders() is called cancelOrder() on exchange instance will get called if the limit price is difference than the orderBook best price', async (done) => {
      expect.assertions(1);
      const exchange = await Exchange.build(credentials);
      const cancelOrder = jest.spyOn(exchange, 'cancelOrder');
      const broker = new Broker(exchange);
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      setTimeout(async () => {
        await broker.cancelOrders();
        expect(cancelOrder).toHaveBeenCalledTimes(3);
        done();
      }, 500);
    });

    test('When cancelOrders() gets called the orders that are to be cancelled will get a new status of \'cancelled\'', async (done) => {
      expect.assertions(1);
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      setTimeout(() => {
        broker.cancelOrders().then(() => {
          expect(broker.queue.every(order => order.status === 'cancelled')).toBe(true);
          done();
        });
      }, 500);
    });

    test('cancelOrders() will return an array of cancelled orders upon successful execution', async (done) => {
      expect.assertions(3);
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      setTimeout(() => {
        broker.cancelOrders().then((cancelledOrders) => {
          expect(Array.isArray(cancelledOrders)).toBe(true);
          expect(cancelledOrders.length).toBe(3);
          expect(cancelledOrders.every(order => order instanceof Order)).toBe(true);
          done();
        });
      }, 500);
    });

    test('cancelOrders() will return a rejected promise with an error object if an unknown error occurs in the exchange', async (done) => {
      expect.assertions(2);
      const success = jest.fn();
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      exchange.executor.connected = false; // simulate connection failure at upstream executor (gdax)
      setTimeout(() => {
        broker.cancelOrders().then((cancelledOrders) => {
          success(cancelledOrders);
        }).catch((e) => {
          expect(e).not.toBeNull();
          expect(success).toHaveBeenCalledTimes(0);
          done();
        });
      }, 500);
    });

    test('cancelOrders() will not cancel if the limit price of the order is the same as the current base price on the order book', async () => {
      orders.forEach(order => exchange.orderbooks[order.product].init(snapshot(order.product)));
      orders.forEach(order => broker.queueOrder(order, true));
      await broker.placeOrders();
      await broker.cancelOrders();
      expect(broker.queue.every(order => order.status === 'placed')).toBe(true);
    });
  });

  describe('Test _getLimitPrice() functionality', () => {
    let buyOrder, sellOrder, exchange, broker, credentials;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
      buyOrder = new Order({ side: 'buy', size: 1, product: 'BCH-USD' });
      sellOrder = new Order({ side: 'sell', size: 1, product: 'BTC-USD' });
    });
    test('_getLimitPrice() will return the initial bid price in the orderbook on the correct side', () => {
      expect(broker._getLimitPrice(buyOrder)).toBe(0);
      expect(broker._getLimitPrice(sellOrder)).toBe(0);
    });
  });

  describe('Test enable() and disable() functionality', () => {
    let credentials, exchange, broker;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
      broker = new Broker(exchange);
    });
    test('running enable() will set the enable prop to true', () => {
      expect(broker.enable()).toBe(true);
      expect(broker.enabled).toBe(true);
    });

    test('running disable() will set the enable prop to false', () => {
      expect(broker.disable()).toBe(true);
      expect(broker.enabled).toBe(false);
    });
  });
});
