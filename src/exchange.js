const {AuthenticatedClient, WebsocketClient} = require('gdax');
const Order = require('./order');
const Engine = require('./engine');
const Process = require('./process');
const OrderBook = require('./orderbook');
const moment = require('moment');
const {EventEmitter} = require('events');
const {get} = require('lodash');

/**
 * A class representing an exchange
 * @extends {EventEmitter}
 */
class Exchange extends EventEmitter {
  /**
   * 
   * @param {Object} credentials - An object representing the gdax credentials for constructing a new exchange instance with gdax client and websocket
   */
  constructor(credentials = {}) {
    super(credentials);
    const key = get(credentials, 'key', null);
    const secret = get(credentials, 'secret', null);
    const passphrase = get(credentials, 'passphrase', null);
    this.executor =  new AuthenticatedClient(key, secret, passphrase, 'https://api-public.sandbox.pro.coinbase.com');
    this.feeds = null
    this.valid = false;
    this.lastHeartbeat = null;
  }

  /**
   * Test validity of instances of exchange class
   * @private
   * @return {boolean} Boolean representing the validity of instances of exchange
   */
  _testValid() {
    return Boolean(
      this.executor &&
      this.executor.key &&
      this.executor.secret &&
      this.executor.passphrase &&
      this.executor instanceof AuthenticatedClient &&
      this.feeds instanceof WebsocketClient &&
      Object.values(this.orderbooks).every(book => book instanceof OrderBook)
    );
  }

  /**
   * A function to load websocket feeds for each supported product on executor exchange (GDAX)
   * @private
   * @async
   * @return {Promise<string[]>} A list of products whose feeds were successfully loaded into exchange instance
   */
  _loadFeeds() {
    return new Promise((resolve, reject) => {
      this.getProducts().then((products) => {
        const productList = products.map(product => product.id);
        this.feeds = new WebsocketClient(productList, 'wss://ws-feed-public.sandbox.pro.coinbase.com', this.executor, { channels: ['level2', 'user'] });
        this.feeds.engine = new Engine(500);
        const checkHeartbeatProcess = new Process(this._checkHeartbeat, this, []);
        this.feeds.engine.start([checkHeartbeatProcess]);
        resolve(productList);
      });
    });
  }

  /**
   * Make orderbook collection
   * @private
   * @async
   * @param {Array} products - A list of product signature strings to build an orderbooks collection with
   * @return {Promise<Orderbook[]>}
   */
  async _makeOrderbooks(products) {
    try {
      !this.orderbooks && (this.orderbooks = {});
      products.forEach((product) => {
        this.orderbooks[product] = new OrderBook(product);
      })
    } catch (error) {
      return Promise.reject('Something went wrong.  Did you supply an array of valid product signatures?');
    }
    return Promise.resolve(this.orderbooks);
  }

  /**
   * A static build method to construct instances of exchange with all relevant data bound
   * @static
   * @public
   * @async
   * @param {object} credentials - A hash of required credentials for the upstream executor exchange (gdax)
   * @return {Promise<Exchange>} An instance of exchange with all initialized data and socket feeds
   */
  static async build(credentials = {}) {
    const exchange = new Exchange(credentials);
    const products = await exchange._loadFeeds();
    await exchange._makeOrderbooks(products);
    exchange._dispatchOrderBookUpdater();
    exchange._dispatchHeartbeatTracker();
    exchange.valid = exchange._testValid();
    return exchange;
  }

  /**
   * A method to dispatch update handlers for exchange orderbooks based on feed messages
   * @private
   * @return {boolean} Boolean denoting successful dispatch of update handler
   */
  _dispatchOrderBookUpdater() {
    this.feeds.on('message', message => {
      message.type === 'snapshot' && this.orderbooks[message.product_id].init(message);
      message.type === 'l2update' && this.orderbooks[message.product_id].queueUpdates(message);
    });
    return true;
  }

  /**
   * A method to dispatch update handlers for exchange orderbooks based on feed messages
   * @private
   * @return {boolean} Boolean denoting successful dispatch of update handler
   */
  _dispatchHeartbeatTracker() {
    this.feeds.on('message', message => {
      message.type === 'heartbeat' && (this.feeds.lastHeartbeat = message);
    });
    return true;
  }

  /**
   * Get the current list of supported products from the executor exchange
   * @public
   * @async
   * @return {Promise<Object[]>} A promise with the product list array
   */
  getProducts() {
    return new Promise((resolve, reject) => {
      this.executor.getProducts((err, response, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  /**
   * Get the details of a previously placed order at the upstream executor
   * @public
   * @async
   * @param {Order} order - The order instance of the order being requested from the executor
   * @return {Promise<Object[]>} A promise with the order data object or error from executor
   */
  getOrder(order) {
    if (order instanceof Order !== true) {
      return Promise.reject({error: 'Invalid input type.  Input param must be an instance of Order class'});
    }
    if (!order.valid) {
      return Promise.reject({error: 'Invalid order. Input order must be valid (order.valid === true)'});
    }
    return new Promise((resolve, reject) => {
      this.executor.getOrder(order.id, (err, response, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  /**
   * Place an order on the upstream executor exchange
   * @public
   * @async
   * @param {Order} order - The order instance of the order to be placed on the upstream executor
   * @return {Promise<Object[]>} A promise with the newly placed order object or error object from the executor
   */
  placeOrder(order) {
    if (order instanceof Order !== true || !order.valid) {
      return Promise.reject({ error: 'Invalid input type.  Input param must be a valid instance of Order class' });
    }
    if (typeof order.limit === 'undefined' || order.limit === null) {
      return Promise.reject({ error: 'A limit price must be specified on order for placement in the market (See setLimit() on the Order class)' });
    }
    if (order.limit <= 0) {
      return Promise.reject({ error: 'A limit price must be greater than 0 in the target currency' });
    }
    let params = {
      size: order.remaining,
      side: order.side,
      product_id: order.product
    }
    params.type = 'limit';
    params.price = order.limit;
    return new Promise((resolve, reject) => {
      this.executor.placeOrder(params, (err, response, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data)
      });
    });
  }

  /**
   * Cancel an order on the upstream executor exchange
   * @public
   * @async
   * @param {Order} order - The order instance to be cancelled on the upstream executor
   * @return {Promise<string[]>} A promise with an array of length one containing the id of the order cancelled on the upstream exchange
   */
  cancelOrder(order) {
    if (order instanceof Order !== true) {
      return Promise.reject({error: 'Invalid input type. Input param must be an instance of the Order class'});
    }
    if (!order.valid) {
      return Promise.reject({error: 'Invalid order. Input order must be valid (order.valid === true)'});
    }
    return new Promise((resolve, reject) => {
      this.executor.cancelOrder(order.id, (err, response, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  async _checkHeartbeat() {
    if (!this.feeds.lastHeartbeat) {
      return null;
    } else {
      const { time } = this.feeds.lastHeartbeat;
      if (moment(time).isBefore(moment().subtract(5, 'seconds'))) {
        await this._loadFeeds();
        return moment().format('hh:mm:ss:SS');
      }
      return moment(time).format('hh:mm:ss:SS');
    }
  }
}

module.exports = Exchange;
