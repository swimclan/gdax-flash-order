/**
 * A class representing the level 2 order book of the exchange
 */
class OrderbookL2 {
  /**
   * @constructor
   * @param {String} product - The product to track orders for
   * @returns {void}
   */
  constructor(product) {
    this.product = product;
    this.book = { bids: [], asks: [] };
  }

  /**
   * A method that initializes the L2 order book with the snapshot sent over the level 2 socket feed channel
   * @public
   * @param {object} message - The snapshot message from the level 2 channel of the exchange feed websocket
   * @returns {boolean} A boolean denoting the successful initialization of the L2 order book
   * @memberof OrderbookL2
   */
  init(message) {
    if (!message || typeof message === 'undefined' || typeof message !== 'object') {
      throw new TypeError('A valid message object must be passed into OrderbookL2.init()');
    }
    if (!message.type || message.type !== 'snapshot') {
      throw new TypeError('A snapshot message from the Exchange websocket must be passed into OrderbookL2.init()');
    }
    if (message.product_id !== this.product) {
      return false;
    }
    this.book.bids = message.bids;
    this.book.asks = message.asks;
    return true;
  }

  /**
   * Method to update the order book .
   * 
   * @public
   * @param {Object} bid object with key value pairs of bids { price: size }
   * @param {Object} ask object with key value pairs of asks { price: size }
   * @memberof Orderbook
   * @returns {void}
   */
  update(message) {
    if (!message || typeof message === 'undefined' || typeof message !== 'object') {
      throw new TypeError('A valid object message must be passed to OrderbookL2.udpate()');
    }
    if (!message.type || message.type !== 'l2update') {
      throw new TypeError('A l2update messsage must be passed into OrderbookL2.udpate()');
    }
    if (message.product_id !== this.product) {
      return false;
    }

    return this._updateItems(message.changes);
  }

  /**
   * A method to update a specific price items on the current orderbook with new updated values from l2update message on exchange websocket feed
   * @private
   * @param {Array} changes - The 'changed' array containing new price updates from l2update message on socket feed
   * @returns {boolean} A Boolean denoting the successful execution of the item updates
   * @memberof OrderbookL2
   */
  _updateItems(changes) {
    if (!changes || typeof changes === 'undefined' || !Array.isArray(changes)) {
      throw new TypeError('An array of changes from the l2update message must be passed in');
    }
    
    changes.forEach(change => {
      const book = this.book[change[0] === 'buy' ? 'bids' : 'asks'];
      let price;
      for (var i in book) {
        price = book[i][0];
        if (price === change[1]) {
          book[i][1] = change[2];
          break;
        } else if (i == book.length - 1) {
          book.push([change[1], change[2]]);
        }
      }
    });
    return true;
  }

  /**
   * Get the best bid and ask from the L2 Orderbook.
   *
   * @returns {Object} object containing size and price data for the best bid and ask
   * @memberof OrderbookL2
   */
  getBestPrices() {

  }
  /**
   * Read the L2 Orderbook data for a specific price.
   *
   * @param {number} price price to query Orderbook for sizes of best bid and ask
   * @returns {Array} A tuple container of [side, price, size] values
   * @memberof OrderbookL2
   */
  getPrice(price) {
    if (!price || typeof price === 'undefined' || typeof price !== 'number') {
      throw new TypeError('A valid price number must be supplied to OrderbookL2.getPrice()');
    }
    let found = null;
    for (var i in this.book.bids) {
      if (found) {
        break;
      } else if (Number(this.book.bids[i][0]) === price) {
        found = ['bid', price, Number(this.book.bids[i][1])];
      }
    }
    for (var i in this.book.asks) {
      if (found) {
        break;
      } else if (Number(this.book.asks[i][0]) === price) {
        found = ['ask', price, Number(this.book.asks[i][1])];
      }
    }
    return found;
  }
}

module.exports = OrderbookL2;
