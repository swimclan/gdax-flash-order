const { WebsocketClient} = require('gdax');
const Exchange = require('../src/exchange');
const Feeds = require('../src/feeds');

describe('Test Exchange class', () => {
  
  describe('Test Exchange construction', () => {
    let credentials, exchange, loadFeeds;
    beforeEach(async () => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = await Exchange.build(credentials);
    });
    test('Exchange can be instantiated as an object', () => {
      expect(typeof new Exchange({}) === 'object').toBe(true);
    });

    test('Exchange instantiated without anything passed to it will have null credentials in the executor', () => {
      const exchange = new Exchange();
      expect(exchange.executor).toHaveProperty('key', null);
      expect(exchange.executor).toHaveProperty('passphrase', null);
      expect(exchange.executor).toHaveProperty('secret', null);
    });

    test('Exchange can be constructed using .build() static method', async () => {
      expect(exchange instanceof Exchange).toBe(true);
    });

    test('instances of Exchange class inherit from EventEmitter', () => {
      const {EventEmitter} = require('events');
      expect(exchange instanceof EventEmitter).toBe(true);
    });

    test('instances of Exchange class have executor, feeds and valid properties', () => {
      expect(new Exchange({})).toHaveProperty('executor');
      expect(new Exchange({})).toHaveProperty('feeds');
      expect(new Exchange({})).toHaveProperty('valid', false);
    });

    test('intstances of exchange are initialized with an empty feeds instance', () => {
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      const exchange = new Exchange(credentials);
      expect(exchange.feeds instanceof Feeds).toBe(true);
      expect(exchange.feeds.length).toBe(0);
    });

    test('instances of exchange are not valid if nothing is passed to it', async () => {
      const exchange = await Exchange.build();
      expect(exchange.valid).toBe(false);
    });

    test('instances of Exchange are not valid if a credentials object is not passed to it', () => {
      const exchange = new Exchange({});
      expect(exchange.valid).toBe(false);
    });

    test('instances of Exchange are not valid if supplied credentials object does not have all authentication props', () => {
      const credentials = {key: 'myKey'};
      const exchange = new Exchange(credentials);
      expect(exchange.valid).toBe(false);
    });

    test('instances of Exchange are valid if supplied credentials object has all authentication props', () => {
      expect(exchange.valid).toBe(true);
    });

    test('instances of Exchange will have a valid broker instance assigned', () => {
      expect(exchange.broker && exchange.broker.valid).toBeTruthy();
    });

    test('Exchange build() will call _loadFeeds() in order to populate exchange with all available socket feeds', () => {
      expect(exchange.feeds.hasOwnProperty('BTC-USD')).toBe(true);
      expect(exchange.feeds['BTC-USD'] instanceof WebsocketClient).toBe(true);
      expect(exchange.feeds.length).toBe(4);
    });

    test('Exchange instance feeds will emit at least one message', (done) => {
      function onMessage(data) {
        expect(typeof data).toBe('object');
        expect(data).toHaveProperty('product_id', 'BTC-USD');
        done();
      }
      exchange.feeds['BTC-USD'].on('message', onMessage);
    });

    test('Exchange instance feeds will emit at least one heartbeat', (done) => {
      function onHeartbeat(data) {
        expect(typeof data).toBe('object');
        expect(data).toHaveProperty('type', 'heartbeat');
        expect(data).toHaveProperty('product_id', 'BCH-USD');
        done();
      }
      exchange.feeds['BCH-USD'].on('heartbeat', onHeartbeat);
    });
  });

  describe('Test _loadFeeds() functionality', () => {
    let credentials, exchange;
    beforeEach(() => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassPhrase'};
      exchange = new Exchange(credentials);
    });
    test('_loadFeeds() will return a resolved promise with the list of executor products that were successfully loaded', () => {
      expect.assertions(3);
      const failure = jest.fn();
      exchange._loadFeeds().then((products) => {
        expect(Array.isArray(products)).toBe(true);
        expect(products[0].id).toBe('BTC-USD');
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });
    test('After _loadFeeds() resolves, the exchange feeds property will contain all feeds for each product on the executor exchange', () => {
      expect.assertions(5);
      const failure = jest.fn();
      exchange._loadFeeds().then((products) => {
        products.forEach(product => expect(exchange.feeds[product.id] instanceof WebsocketClient).toBe(true));
        return;
      }).catch((err) => {
        failure(err);
      }).then(() => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Test _loadFeed() functionality', () => {
    let exchange, credentials;
    beforeEach(() => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassPhrase'};
      exchange = new Exchange(credentials);
    });
    test('_loadFeed() will throw a TypeError if nothing is passed to it', () => {
      expect(() => exchange._loadFeed()).toThrow(TypeError);
    });

    test('_loadFeed() will return false and do nothing if there is already a feed on that product', () => {
      exchange._loadFeed('ETH-USD');
      expect(exchange._loadFeed('ETH-USD')).toBe(false);
    });
    
    test('_loadFeed() will throw TypeError if anything other than a valid currency pair string is passed in', () => {
      expect(() => exchange._loadFeed('ET-USD')).toThrow(TypeError);
      expect(() => exchange._loadFeed(0)).toThrow(TypeError);
      expect(() => exchange._loadFeed(['ETH-USD'])).toThrow(TypeError);
    });

    test('If a valid currency product string is passed to _loadFeed(), feeds collection will have a property for that product string', () => {
      exchange._loadFeed('ETH-USD');
      expect(typeof exchange.feeds['ETH-USD'] !== 'undefined');
    });

    test('If a valid currency product string is passed to loadFeed(), the value of that product feed will be an instance of gdax WebsocketClient', () => {
      exchange._loadFeed('BTC-USD');
      expect(exchange.feeds['BTC-USD'] instanceof WebsocketClient).toBe(true);
    });

    test('If a valid currency pair string is passed to loadFeed() then the string of the currency pair will be returned by the function', () => {
      exchange._closeFeed();
      expect(exchange._loadFeed('BCH-USD')).toBe('BCH-USD');
    });
  });

  describe('Test _closeFeed() functionality', () => {
    let exchange, credentials;
    beforeEach(() => {
      credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassPhrase'};
      exchange = new Exchange(credentials);
    });
    test('_closeFeed() will close all feeds if nothing is passed to it', () => {
      exchange._loadFeed('ETH-USD');
      exchange._loadFeed('BTC-USD');
      exchange._closeFeed();
      expect(exchange.feeds.length).toBe(0);
    });

    test('_closeFeed() will throw if anything other than a valid currency pair signature string is passed to it', () => {
      expect(() => exchange._closeFeed('ET-USD')).toThrow(TypeError);
      expect(() => exchange._closeFeed(['BCH-USD'])).toThrow(TypeError);
      expect(() => exchange._closeFeed(12)).toThrow(TypeError);
    });

    test('If valid currency signature is passed to closeFeed() that currency property will not exist in feeds collection', () => {
      exchange._loadFeed('ETH-USD');
      expect(typeof exchange.feeds['ETH-USD']).not.toBe('undefined');
      exchange._closeFeed('ETH-USD');
      expect(typeof exchange.feeds['ETH-USD']).toBe('undefined');
    });

    test('If a valid currency signature is passed to closeFeed() but is not currently a loaded feed, nothing will happen', () => {
      exchange._closeFeed('BTC-USD');
      expect(typeof exchange.feeds['BTC-USD']).toBe('undefined');
    });
  });

  describe('Test _makeOrderBooks() ...', () => {
    let credentials, exchange;
    beforeEach(async () => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = await Exchange.build(credentials);
    });
    test('_makeOrderBooks will return a rejected Promise if anything other than an array is passed', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange._makeOrderBooks(1234).then((orderbooks) => {
        return success(orderbooks);
      }).catch((err) => {
        expect(typeof err).toBe('string');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('_makeOrderBooks will return a resolved Promise with a list of newly created orderbooks when passed a valid list of prouct signatures', async () => {
      const products = await exchange.getProducts()
      const orderbooks = await exchange._makeOrderBooks(products.map(product => product.id));
      expect(orderbooks).toEqual(exchange.orderBooks);
      expect(orderbooks['BTC-USD'].product).toBe('BTC-USD');
      expect(orderbooks['BTC-USD'].book).toEqual({ bid: 0, ask: 0 });
    });
  });

  describe('Test Exchange getOrder() calls', () => {
    let exchange, knownOrder, unknownOrder, validOrder, invalidOrder;
    beforeAll(() => {
      const Order = require('../src/order');
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = new Exchange(credentials);
      knownOrder = new Order({
        product: 'BTC-USD',
        side: 'buy',
        size: 1
      });
      unknownOrder = new Order({
        product: 'BCH-USD',
        side: 'sell',
        size: 2
      });
      invalidOrder = new Order({
        product: 'BCH-USD',
        side: 'neutral'
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

  describe('Test Exchange getProducts() calls', () => {
    let exchange, credentials;
    beforeAll(() => {
      credentials = { key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase' };
      exchange = new Exchange(credentials);
    });
    test('Calling getProducts() will return a resolved promise with a list of supported currency pair products', () => {
      expect.assertions(3);
      let failure = jest.fn();
      exchange.getProducts().then((products) => {
        expect(Array.isArray(products)).toBe(true);
        expect(products[0].id).toBe('BTC-USD');
        return;
      }).catch((err) => {
        failure(err);
      }).then((e) => {
        expect(failure).toHaveBeenCalledTimes(0);
      });
    });
    test('Calling getProducts() will reject if an error occurs at the executor exchange', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.executor.connected = false;
      exchange.getProducts().then((products) => {
        success(products);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Test Exchange placeOrder() calls', async () => {
    let exchange, validOrder, invalidOrder, validLimitOrder, orderNoLimit;
    beforeAll(async () => {
      const Order = require('../src/order');
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = await Exchange.build(credentials);
      validLimitOrder = new Order({
        product: 'BTC-USD',
        side: 'buy',
        size: 1
      });
      validLimitOrder.setLimit(7323.12);
      orderNoLimit = new Order({
        product: 'ETH-USD',
        side: 'buy',
        size: 2
      });
      invalidOrder = new Order({
        product: 'BCH-USD',
        side: 'neutral'
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

    test('placeOrder() will return a rejected promise if a valid order with no specified limit price is passed to it', () => {
      expect.assertions(2);
      const success = jest.fn();
      exchange.placeOrder(orderNoLimit).then((order) => {
        success(order);
      }).catch((err) => {
        expect(typeof err).toBe('object');
        expect(success).toHaveBeenCalledTimes(0);
      });
    });

    test('placeOrder() will return a rejected promise if an error occurs during the async operation (ie no connection)', async () => {
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      const downExchange = await Exchange.build(credentials);
      downExchange.executor._connection(false); // simulate internet connection failure
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
      Order = require('../src/order');
      const credentials = {key: 'myKey', secret: 'mySecret', passphrase: 'myPassphrase'};
      exchange = new Exchange(credentials);
      invalidOrder = new Order({
        size: 1,
        side: 'buy'
      });
      validOrderWithId = new Order({
        size: 1,
        side: 'buy',
        product: 'ETH-USD'
      });
      anotherValidOrderWithId = new Order({
        size: 2.3,
        side: 'sell',
        product: 'ETH-USD'
      });
      validOrderNullId = new Order({
        size: 1,
        side: 'buy',
        product: 'ETH-USD'
      });
      unknownOrderWithId = new Order({
        size: 1,
        side: 'buy',
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
          product: 'BCH-USD'
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
