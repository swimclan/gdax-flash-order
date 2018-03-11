const {EventEmitter} = require('events');
const {get} = require('lodash');

class Exchange extends EventEmitter {
  constructor(options = {}) {
    super(options);
    this.executor = get(options, 'executor', null);
    this.valid = this._testValid();
  }

  _testValid() {
    return Boolean(
      this.executor &&
      this.executor.key &&
      this.executor.secret &&
      this.executor.passphrase
    );
  }
}

module.exports = Exchange;
