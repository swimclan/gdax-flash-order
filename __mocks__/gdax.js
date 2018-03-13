'use strict';

const Gdax = jest.genMockFromModule('gdax');

Gdax.AuthenticatedClient = function(key, secret, passphrase, apiURI, options = {}) {
  this.key = key;
  this.secret = secret;
  this.passphrase = passphrase;

  this.getOrder = function(orderId, callback) {
    if (orderId !== '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08') {
      return callback({error: 'Invalid orderId supplied'}, {}, null);
    }
    return callback(null, {}, {
      "id": "68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08",
      "size": "1.00000000",
      "product_id": "BTC-USD",
      "side": "buy",
      "stp": "dc",
      "funds": "9.9750623400000000",
      "specified_funds": "10.0000000000000000",
      "type": "market",
      "post_only": false,
      "created_at": "2016-12-08T20:09:05.508883Z",
      "done_at": "2016-12-08T20:09:05.527Z",
      "done_reason": "filled",
      "fill_fees": "0.0249376391550000",
      "filled_size": "0.01291771",
      "executed_value": "9.9750556620000000",
      "status": "done",
      "settled": true
    });
  }
}

module.exports = Gdax;
