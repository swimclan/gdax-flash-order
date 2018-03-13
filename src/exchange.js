const Order = require('./order');
const {EventEmitter} = require('events');
const {get} = require('lodash');

/**
 * A class representing an exchange 
 */
class Exchange extends EventEmitter {
  /**
   * 
   * @param {Object} options - An object representing the options for constructing a new exchange instance
   * @param {Gdax.AuthenticatedClient} executor - An instance of the Gdax authenticated client
   */
  constructor(options = {}) {
    super(options);
    this.executor = get(options, 'executor', null);
    this.valid = this._testValid();
  }

  /**
   * Test validity of instances of exchange class
   * @private
   * @return {boolean} Boolean representing the validity of instances of exchange
   */
  _testValid() {
    return Boolean(
      this.executor &&
      this.executor.key &&
      this.executor.secret &&
      this.executor.passphrase
    );
  }

  /**
   * @public
   * @async
   * @param {Order} order - The order instance of the order being requested from the executor
   * @return {Promise} A promise with the order data object or error from executor
   */
  getOrder(order) {
    if (order instanceof Order !== true) {
      return Promise.reject({error: 'Invalid input type.  Input param must be an instance of Order class'});
    }
    if (!order.valid) {
      return Promise.reject({error: 'Invalid order. Input order must be valid (order.valid === true)'});
    }
    return new Promise((resolve, reject) => {
      this.executor.getOrder(order.id, (err, response, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data)
      });
    });
  }
}

module.exports = Exchange;
