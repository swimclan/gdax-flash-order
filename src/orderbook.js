const {sortPrices, createList} = require('./utils');
const Engine = require('./engine');
const Process = require('./process');
const {Node} = require('./node');

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
    this.book = { bids: null, asks: null };
    this.queue = [];
    this.engine = new Engine(0, false);
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
    this.book.bids = createList(sortPrices(message.bids, true));
    this.book.asks = createList(sortPrices(message.asks));
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

  applyQueue() {
    if (!this.book.bids || !this.book.asks || this.queue.length === 0) { return false; }
    const changes = this.queue.splice(0);
    changes.forEach(change => {
      const side = change[0] === 'buy' ? 'bids': 'asks';
      const price = change[1];
      const size = change[2];
      let current, prev;
      let determinant = side === 'asks' ? 1 : -1;
      while(true) {
        if (!current) {
          if ((price * determinant) < (this.book[side].value[0] * determinant)) {
            const firstNode = new Node([price, size], this.book[side]);
            this.book[side] = firstNode;        
          }
          if (Number(price) === Number(this.book[side].value[0]) && Number(size) === 0) {
            this.book[side] = this.book[side].next;
          }
          current = this.book[side];
        }
        if (current.next && (price * determinant) > (current.value[0] * determinant) && (price * determinant) < (current.next.value[0] * determinant)) {
          const temp = current.next;
          current.next = new Node([price, size], temp);
        } else if (!current.next && (price * determinant) > (current.value[0] * determinant)) {
          current.next = new Node([price, size], null);
        } else if (Number(price) === Number(current.value[0]) && Number(size) > 0) {
          current.value = [price, size];
        } else if (prev && Number(price) === Number(current.value[0]) && Number(size) === 0) {
          prev.next = current.next;
        }
        prev = current;
        current = current.next;
        if (!current) { break; }
      }
    });
    return true; 
  }
}

module.exports = Orderbook;
