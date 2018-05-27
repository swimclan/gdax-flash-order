const { EventEmitter } = require('events');
const { WebsocketClient } = require('gdax');
const { validateProduct } = require('./utils');

/**
 * A class representing a price ticker feeds collection 
 */
class Feeds extends EventEmitter {
  /**
   * Constructor for creating new feeds intances
   */
  constructor() {
    super();
    this.length = this._getFeeds().length;
  }

  /**
   * A helper method that calculates and returns the current length of the feeds collection
   * @private
   * @return {number} A number whose value represents the number of feeds that are bound to the instance
   */
  _getFeeds() {
    return Object.getOwnPropertyNames(this).filter(prop => validateProduct(prop));
  }

  /**
   * A function to add a new feed to the instance
   * @public
   * @param {string} product - The product signature of the product feed being added to the instance
   * @param {WebsocketClient} feed - The websocket feed client being added to the instance
   * @return {boolean} A boolean denoting if an action was applied to the instance
   */
  add(product, feed) {
    if (arguments.length !== 2 || typeof arguments[0] !== 'string' || arguments[1] instanceof WebsocketClient !== true || !validateProduct(product)) {
      throw new TypeError('A valid product and websocket feed client must be supplied');
    }
    if (!this[product]) {
      this[product] = feed;
      this.length++;
      this.emit('update', product);
      return true;
    }
    return false;
  }

  /**
   * A function to remove a feed from the instance
   * @public
   * @param {string} product - The product signature of the feed to be removed from the instance
   * @return {boolean} A boolean value to denote whether action was taken on the instance
   */
  remove(product) {
    if (!product || typeof product !== 'string' || !validateProduct(product)) {
      throw new TypeError('A valid product signature must be supplied');
    }
    if (this[product]) {
      delete this[product];
      this.length--;
      this.emit('update', product);
      return true;
    }
    return false;
  }

  /**
   * A function to clear out all feeds from the instance
   * @public
   * @return {boolean} A boolean denoting whether action was taken on the instance
   */
  clear() {
    if (this.length > 0) {
      this._getFeeds().forEach(product => delete this[product]);
      this.length = 0;
      this.emit('update');
      return true;
    }
    return false;
  }
}

module.exports = Feeds;
