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
    this.book = { bid: {}, ask: {} };
  }
  /**
   * Get the best bid and ask from the L2 Orderbook.
   *
   * @returns {Object} object containing size and price data for the best bid and ask
   * @memberof OrderbookL2
   */
  getBestPrices(){
    const bids = Object.keys(this.book.bid);
    const asks = Object.keys(this.book.ask);
    let bidObject = null;
    let askObject = null;
    if (bids.length) {
      const bestBid = Math.max(...bids);
      bidObject = {
        price: bestBid,
        size: this.book.bid[bestBid],
      };
    }
    if (asks.length) {
      const bestAsk = Math.min(...asks);
      askObject = {
        price: bestAsk,
        size: this.book.ask[bestAsk],
      };
    }
    return {
      bid: bidObject,
      ask: askObject,
    };
  }
  /**
   * Read the L2 Orderbook data for a specific price.
   *
   * @param {number} price price to query Orderbook for sizes of best bid and ask
   * @returns {Object} Object containing the side, price, and size of the bid or ask
   * @memberof OrderbookL2
   */
  getPrice(price){
    if (!price || typeof price !== 'number') {
      throw new TypeError('L2 Orderbook price is not a valid number');
    }
    const result = {};
    if (this.book.bid[price]) {
      result.side = 'bid';
      result.price = price;
      result.size = this.book.bid[price];
    } else if (this.book.ask[price]){
      result.side = 'ask';
      result.price = price;
      result.size = this.book.ask[price];
    }
    if (Object.keys(result).length) {
      return result;
    }
    return null;
  }
  /**
   * Method to update the order book best bid and ask.
   * 
   * @param {Object} bid object with key value pairs of bids { price: size }
   * @param {Object} ask object with key value pairs of asks { price: size }
   * @memberof Orderbook
   * @returns {void}
   */
  update({ bid = null, ask = null }) {
    if (bid !== null && typeof bid !== 'object') {
      throw new TypeError('Bid parameter is not an object');
    } else if (ask !== null && typeof ask !== 'object') {
      throw new TypeError('Ask parameter is not an object');
    }
    bid !== null && (this.book.bid = {
      ...this.book.bid,
      ...bid,
    });
    ask !== null && (this.book.ask = {
      ...this.book.ask,
      ...ask,
    });
  }
}

module.exports = OrderbookL2;
