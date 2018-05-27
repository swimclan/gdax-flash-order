const { EventEmitter } = require('events');
const Feeds = require('./feeds');

/**
 * A class representing the level 1 order book of the exchange
 */
class Orderbook extends EventEmitter {
  /**
   * 
   * @param {Feeds} feeds - The collection of socket feeds for each product in the current orderbook
   */
  constructor(feeds = new Feeds()) {
    super(feeds);
    this.feeds = feeds;
    this.book = { bids: [], asks: [] };
  }
}

module.exports = Orderbook;