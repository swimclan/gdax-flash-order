const {EventEmitter} = require('events');
const {get} = require('lodash');
const {validateProduct} = require('./utils');

/**
 * A class representing an Order
 * @extends EventEmitter
 */
class Order extends EventEmitter {
  /**
   * @param {Object} options - Set of options for creating a new order
   * @param {string} options.product - A string representing the product pair
   * @param {number} options.size - A number representing the size of the order
   * @param {string} options.side  - A string representing the side of the order (eg 'buy' or 'sell'
   * @param {number} [options.limit] - A number representing the limit price of the order
   * @param {boolean} [options.market] - A boolean representing whether the order is a market taking order (eg market order)
   */
  constructor(options = {}) {
    super(options);
    this.id = null;
    this.product = get(options, 'product', null);
    this.limit = null;
    this.side = get(options, 'side', null);
    this.size = get(options, 'size', 0);
    this.remaining = this.size;
    this.status = 'created';
    this.valid = this._testValid();
  }

  /**
   * Test if order instance is valid
   * @private
   * @return {boolean} A boolean representing the validity of the order instance
   */
  _testValid() {
    return Boolean(
      validateProduct(this.product)
      && this.side
      && (this.side === 'buy' || this.side === 'sell')
      && this.size
    );
  }

  /**
   * Assign a limit price to the order instance
   * @public
   * @param {number} price - The price to set the order intstance limit property to
   * @return {boolean} A boolean (true) denoting that the function ran successfully
   */
  setLimit(price) {
    if (typeof price === 'undefined' || typeof price !== 'number') {
      throw new TypeError('A valid price number must be supplied');
    }
    this.limit = price;
    return true;
  }

  /**
   * Assign an id to the order instance
   * @public
   * @param {string} orderid - A string representing the order id being assigned to the instance
   * @return {string} The updated order id
   */
  setId(orderid) {
    if (typeof orderid !== 'string') {
      throw new TypeError('Type of orderid must be string');
    }
    this.id = orderid;
    return true;
  }

  /**
   * @public
   * @param {string} status - A string representing the status to set on the order instance
   * @return {string} The updated order status
   */
  setStatus(status) {
    const validStatuses = ['created', 'partial', 'filled', 'cancelled', 'cancelling', 'placed', 'placing'];
    if (typeof status !== 'string') {
      throw new TypeError('Type of order status must be a string');
    } else if (validStatuses.indexOf(status) === -1) {
      throw new TypeError('Order status must be one of either \'created\', \'partial\', \'filled\', \'cancelled\', \'cancelling\', \'placed\' or \'placing\'');
    }
    this.status = status;
    return true;
  }

  /**
   * @public
   * @param {number} size - The remaining size of the order to be filled
   * @return {numnber} The updated size
   */
  setRemaining(size) {
    if (typeof size === 'undefined' || typeof size !== 'number' || size < 0) {
      throw new TypeError('A size must be supplied and must be a valid positive number');
    }
    this.remaining = size;
    return true;
  }
}

module.exports = Order;
