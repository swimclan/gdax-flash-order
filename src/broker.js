const {EventEmitter} = require('events');
const {AuthenticatedClient, WebsocketClient} = require('gdax');

class Broker extends EventEmitter {
  constructor(exchange={}) {
    super(exchange);
    this.exchange = exchange;
    this.valid = this._testValid();
  }

  _testValid() {
    return Boolean(
      this.exchange &&
      this.exchange.executor instanceof AuthenticatedClient &&
      this.exchange.feed instanceof WebsocketClient
    );
  }
}

module.exports = Broker;
