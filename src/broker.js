const {EventEmitter} = require('events');
const {AuthenticatedClient, WebsocketClient} = require('gdax');
const Order = require('./order');
const Engine = require('./engine');
const Process = require('./process');

/**
 * A class representing a broker.  Instance of this class are generated by the exchange
 */
class Broker extends EventEmitter {
  /**
   * A constructor used to create instances of the broker class
   * @param {Exchange} exchange - An instance of the Exchange class containing a websocket feed and an authenticated client for order execution (executor)
   */
  constructor(exchange={}) {
    super(exchange);
    this.exchange = exchange;
    this.enabled = false;
    this.queue = [];
    this.engine = new Engine(100);
    this.valid = this._testValid();
  }

  /**
   * Test validity of instances of broker class
   * @private
   * @return {boolean} Boolean representing the validity of instances of broker
   */
  _testValid() {
    return Boolean(
      this.exchange &&
      this.exchange.valid &&
      this.exchange.executor instanceof AuthenticatedClient &&
      this.exchange.feeds instanceof WebsocketClient &&
      this.engine instanceof Engine
    );
  }

  /**
   * A function to get the best limit price according to the current state of the
   * exchange orderbooks
   * @private
   * @param {Order} order - The order about which a current limit price will be determined
   * @return {number} The price of the best limit order
   */
  _getLimitPrice(order) {
    const currentOrderBook = this.exchange.orderBooks[order.product].book;
    return currentOrderBook[order.side === 'buy' ? 'bid' : 'ask'];
  }

  /**
   * A function to disable the broker
   * @public
   * @return {boolean} A boolean true when disabling was successful
   */
  disable() {
    this.enabled = false;
    this.engine.stop();
    return true;
  }

  /**
   * A function to enable the broker
   * @public
   * @return {boolean} A boolean true when enabling was successful
   */
  enable() {
    this.enabled = true;
    this._processQueue();
    return true;
  }

  /**
   * Process the broker's queue of orders
   * @private
   * @return {boolean} A boolean to denote the successful dispatch of the queue processor
   */
  _processQueue() {
    this._dispatchFilledOrderHandler();
    const placeOrdersProcess = new Process(this.placeOrders, this, []);
    const cancelOrdersProcess = new Process(this.cancelOrders, this, []);
    this.engine.start([placeOrdersProcess, cancelOrdersProcess])
  }

  /**
   * Load a valid order into the broker's order queue
   * @public
   * @param {Order} order - The order to be loaded into the order queue
   * @param {boolean} [silent=false] - A boolean denoting whether to enable the broker defaults
   * @return {Order} Order that was successfully loaded into the order queue 
   */
  queueOrder(order, silent = false) {
    if (order instanceof Order !== true || !order.valid) {
      throw new TypeError('Must pass a valid order instance');
    }
    this.queue.push(order);
    !silent && !this.enabled && this.enable();
    return order;
   }

   /**
    * Check for the filled state of a placed order
    * @private
    * @param {Object} message - The socket feed message containing a filled order
    * @return {string[]} List of order ids that have been filled
    */
   _checkFilled(message) {
     this.queue.forEach(order => {
      if (message.type === 'done' && message.reason === 'filled' && message.order_id === order.id && parseInt(message.remaining_size) === 0) {
        order.setStatus('filled');
      }
     });
   }

   /**
    * Dispatch a filled order feed listener on the 'user' channel of the exchange feeds
    * @private
    * @return {boolean} A boolean denoting the successful dispatch of the listener
    */
   _dispatchFilledOrderHandler() {
    this.exchange.feeds.on('message', (data) => {
      if (data.type !== 'ticker') {
        this._checkFilled(data);
      }
    });
    return true;
   }

   /**
    * Place any created orders in the queue into the market
    * @async
    * @public
    * @return {Promise<Order[]]>} A list of orders that were placed
    * 
    */
  async placeOrders() {
    const placedOrders = [];
    let placedOrder;
    try {
    this.queue.filter(order => order.status === 'created' || order.status === 'cancelled').forEach(async (order) => {
      const bestLimit = this._getLimitPrice(order);
      if (bestLimit <= 0) { return []; }
      order.setLimit(bestLimit);
      order.valid && (placedOrder = await this.exchange.placeOrder(order));
      order.setId(placedOrder.id);
      order.setStatus('placed');
      placedOrders.push(order);
    });
    return placedOrders;
    } catch (e) {
      return e;
    }

  }

  /**
   * Cancel placed orders whose limit price differs from the best price on the orderbook for that product
   * @public
   * @async
   * @return {Promise<Order[]]>} A list of orders that were cancelled
   */
  async cancelOrders() {
    const cancelledOrders = [];
    try {
    this.queue.filter(order => order.status === 'placed').forEach(async (order) => {
      if (this.exchange.orderBooks[order.product].book[order.side === 'buy' ? 'bid' : 'ask'] !== order.limit) {
        await this.exchange.cancelOrder(order);
        order.setStatus('cancelled');
        cancelledOrders.push(order);
      }
    });
    return cancelledOrders;
    } catch (e) {
      return e;
    }
  }
}

module.exports = Broker;
