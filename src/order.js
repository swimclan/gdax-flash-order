const {EventEmitter} = require('events');
const {get} = require('lodash');
const {validateProduct} = require('./utils');

class Order extends EventEmitter {
  constructor(options = {}) {
    super(options);
    this.id = null;
    this.product = get(options, 'product', null);
    this.limit = get(options, 'limit', null);
    this.market = get(options, 'market', false);
    this.side = get(options, 'side', null);
    this.size = get(options, 'size', 0);
    this.valid = this._testValid();
  }
  _testValid() {
    return Boolean(
      validateProduct(this.product)
      && this.side
      && (this.side === 'buy' || this.side === 'sell')
      && this.size
      && ((this.limit  && !this.market) || (!this.limit && this.market))
    );
  }
}

module.exports = Order;
