const {EventEmitter} = require('events');
const {AuthenticatedClient, WebsocketClient} = require('gdax');
const Order = require('./order');

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
      this.exchange.feeds.length > 0
    );
  }

  /**
   * A function to disable the broker
   * @public
   * @return {boolean} A boolean true when disabling was successful
   */
  disable() {
    this.enabled = false;
    return true;
  }

  /**
   * A function to enable the broker
   * @public
   * @return {boolean} A boolean true when enabling was successful
   */
  enable() {
    this.enabled = true;
    return true;
  }

  /**
   * Load a valid order into the broker's order queue
   * @public
   * @param {Order} order - The order to be loaded into the order queue
   * @return {Order} Order that was successfully loaded into the order queue 
   */
   queueOrder(order) {
    if (order instanceof Order !== true || !order.valid) {
      throw new TypeError('Must pass a valid order instance');
    }
    this.queue.push(order);
    !this.enabled && this.enable();
    return order;
   }
}

module.exports = Broker;
