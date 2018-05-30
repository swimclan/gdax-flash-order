/**
 * A class representing the level 1 order book of the exchange
 */
class Orderbook {
  /**
   * @constructor
   * @param {String} product - The product to track orders for
   * @returns {void}
   */
  constructor(product) {
    this.product = product;
    this.book = { bid: 0, ask: 0 };
  }
  /**
   * Method to update the order book best bid and ask
   * @param {Number} bid The best bid price
   * @param {Number} ask The best ask price
   * @memberof Orderbook
   * @returns {void}
   */
  update({ bid = null, ask = null }) {
    if (bid !== null && typeof bid !== 'number') {
      throw new TypeError('Bid parameter is not a number');
    } else if (ask !== null && typeof ask !== 'number') {
      throw new TypeError('Ask parameter is not a number');
    }
    bid !== null && (this.book.bid = bid);
    ask !== null && (this.book.ask = ask);
  }
}

module.exports = Orderbook;