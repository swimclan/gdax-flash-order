const {sortPrices} = require('./utils');
const Engine = require('./engine');
const Process = require('./process');
/**
 * A class representing the level 2 order book of the exchange
 */
class Orderbook {
  /**
   * @constructor
   * @param {String} product - The product to track orders for
   * @returns {void}
   */
  constructor(product='BTC-USD') {
    this.product = product;
    this.book = { bids: [], asks: [] };
    this.queue = [];
    this.engine = new Engine(1, false);
  }

  /**
   * A method to initialize the orderbook with the snapshop data from the exchange socket feed
   * @public
   * @memberof Orderbook
   * @param {object} message - The message object from the snapshot message from level2 channel of socket feed
   * @returns {boolean} - Boolean denoting the successful execution of the initialization
   */
  init(message) {
    if (!message || typeof message === 'undefined' || typeof message !== 'object') {
      throw new TypeError('Orderbook.init() : A valid level2 snapshot message object must be passed in');
    }
    if (!message.type || message.type !== 'snapshot') {
      throw new TypeError('Orderbook.init() : A message of type snapshot must be passed in');
    }
    if (message.product_id !== this.product) {
      return false;
    }
    this.book.bids = sortPrices(message.bids);
    this.book.asks = sortPrices(message.asks);
    const applyQueueProcess = new Process(this.applyQueue, this, null);
    this.engine.start([applyQueueProcess]);
    return true;
  }

  /**
   * A method to queue updates to the level2 order book
   * @public
   * @memberof Orderbook
   * @param {object} message - A l2update message from the exchange socket feed
   * @returns {boolean} A boolean denoting the successful execution of the update queueing
   */
  queueUpdates(message) {
    if (!message || typeof message === 'undefined' || typeof message !== 'object') {
      throw new TypeError('Orderbook.queueUpdates() : A valid level2 update message object must be passed in');
    }
    if (!message.type || message.type !== 'l2update') {
      throw new TypeError('Orderbook.queueUpdates() : A message of type l2update must be passed in');
    }
    this.queue = [...this.queue, ...message.changes];
    return true;
  }

  /**
   * A method to apply all the price changes in-queue to the current sorted book
   * @private
   * @memberof Orderbook
   * @returns {boolean} A boolean denoting the successful queue processing execution
   */
  applyQueue() {
    if (!this.book.bids.length || !this.book.asks.length || !this.queue.length) { return false }
    while(this.queue.length) {
      const change = this.queue.shift();
      let side = change[0] === 'buy' ? 'bids' : 'asks';
      let saved = [];
      let found = false;
      while(this.book[side].length) {
        if (this.book[side][0][0] === change[1] && !found) {
          this.book[side].shift();
          change[2] != 0 && saved.push([change[1], change[2]]);
          found = true;
        } else if (this.book[side][0][0] > change[1] && !found) {
          change[2] != 0 && saved.push([change[1], change[2]]);
          found = true;
        } else {
          saved.push(this.book[side].shift());
        }
      }
      !found && saved.push([change[1], change[2]]);
      this.book[side] = saved.slice();
    };
    return true;
  }
}

module.exports = Orderbook;
