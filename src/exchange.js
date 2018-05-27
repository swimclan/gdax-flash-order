const {AuthenticatedClient, WebsocketClient} = require('gdax');
const Order = require('./order');
const Broker = require('./broker');
const Feeds = require('./feeds');
const utils = require('./utils');
const {EventEmitter} = require('events');
const {get} = require('lodash');

/**
 * A class representing an exchange 
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
    this.executor =  new AuthenticatedClient(key, secret, passphrase, 'https://api-public.sandbox.gdax.com');
    this.feeds = new Feeds();
    this.valid = this._testValid();
    // Test for broker instance for final validity check
    this.valid = this._generateBroker();
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
      this.feeds instanceof Feeds
    );
  }

  /**
   * Generate the assigned broker to this exchange instance
   * @private
   * @return {boolean} Boolean value that demonstrates if the broker instance generated is valid
   */
  _generateBroker() {
    this.broker = new Broker(this);
    return this.broker.valid;
  }

  /**
   * Load a new WebsocketClient to the feeds collection
   * @public
   * @param {string} product - The product signature of the currency pair feed being loaded
   * @return {string} Product signature of the currency pair that was successfully loaded
   */
  loadFeed(product) {
    if (!product || typeof product !== 'string' || !utils.validateProduct(product)) {
      throw new TypeError('A valid currency pair signature must be supplied');
    } else if (this.feeds[product] && this.feeds[product] instanceof WebsocketClient) {
      return false;
    }
    this.feeds.add(product, new WebsocketClient([product], 'wss://ws-feed-public.sandbox.gdax.com', this.executor, { channels: 'ticker' }));
    return product;
  }

  /**
   * Close out a loaded feed from the exchange
   * @public
   * @param {string} product - The product signature of the currency pair feed being closed out
   * @return {string} Product signature of the currency pair that was successfully closed out
   */
  closeFeed(product) {
    if (!product) {
      this.feeds.clear();
    } else if (typeof product !== 'string' || !utils.validateProduct(product)) {
      throw new TypeError('A valid currency pair signature must be supplied');
    } else {
      this.feeds.remove(product);
    }
    return product;
  }

  /**
   * Get the details of a previously placed order at the upstream executor
   * @public
   * @async
   * @param {Order} order - The order instance of the order being requested from the executor
   * @return {Promise<any>} A promise with the order data object or error from executor
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
   * @return {Promise<any>} A promise with the newly placed order object or error object from the executor
   */
  placeOrder(order) {
    if (order instanceof Order !== true) {
      return Promise.reject({error: 'Invalid input type.  Input param must be an instance of Order class'});
    }
    if (!order.valid) {
      return Promise.reject({error: 'Invalid order. Input order must be valid (order.valid === true)'});
    }
    let params = {
      size: order.size,
      side: order.side,
      product_id: order.product
    }
    params.type = order.market ? 'market' : 'limit';
    if (params.type === 'limit') {
      params.price = order.limit
    }
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
   * @return {Promise<any[]>} A promise with an array of length one containing the id of the order cancelled on the upstream exchange
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
}

module.exports = Exchange;
