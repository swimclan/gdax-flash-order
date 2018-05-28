'use strict';
const {get, has} = require('lodash');
const Gdax = jest.genMockFromModule('gdax');
const {EventEmitter} = require('events');
const {whilst} = require('async');

let orders = ['68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08', 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2'];

Gdax.AuthenticatedClient = function(key, secret, passphrase, apiURI, options = {}) {
  this.key = key;
  this.secret = secret;
  this.passphrase = passphrase;
  this.connected = true;

  this._connection = function(state) {
    return this.connected = state === true;
  }

  this.getProducts = function(callback) {
    const error = !this.connected ? { message: 'An error occured' } : null;
    return callback(error, {},
      [
        {
          id: "BTC-USD",
          base_currency: "BTC",
          quote_currency: "USD",
          base_min_size: "0.001",
          base_max_size: "10000.00",
          quote_increment: "0.01"
        },
        {
          id: "ETH-USD",
          base_currency: "ETH",
          quote_currency: "USD",
          base_min_size: "0.001",
          base_max_size: "10000.00",
          quote_increment: "0.01"
        },
        {
          id: "BCH-USD",
          base_currency: "BCH",
          quote_currency: "USD",
          base_min_size: "0.001",
          base_max_size: "10000.00",
          quote_increment: "0.01"
        },
        {
          id: "ETH-BTC",
          base_currency: "ETH",
          quote_currency: "BTC",
          base_min_size: "0.001",
          base_max_size: "10000.00",
          quote_increment: "0.001"
        },
    ]);
  }

  this.getOrder = function(orderId, callback) {
    if (orderId !== '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08') {
      return callback({message: 'Invalid orderId supplied.  Order not found.'}, {}, null);
    }
    return callback(null, {}, {
      id: '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08',
      size: '1.00000000',
      product_id: 'BTC-USD',
      side: 'buy',
      stp: 'dc',
      funds: '9.9750623400000000',
      specified_funds: '10.0000000000000000',
      type: 'market',
      post_only: false,
      created_at: '2016-12-08T20:09:05.508883Z',
      done_at: '2016-12-08T20:09:05.527Z',
      done_reason: 'filled',
      fill_fees: '0.0249376391550000',
      filled_size: '0.01291771',
      executed_value: '9.9750556620000000',
      status: 'done',
      settled: true
    });
  }

  this.cancelOrder = function(orderId, callback) {
    const targetOrder = orders.indexOf(orderId);
    if (targetOrder === -1) {
      return callback({message: 'Invalid orderId supplied.  Order not found.'}, {}, null);
    }

    return callback(null, {}, orders.splice(targetOrder, 1));
  }

  this.placeOrder = function(params, callback) {
    if (!has(params, 'product_id') || !has(params, 'size') || !has(params, 'side')) {
      return callback({message: 'Invalid params supplied.  Must supply size, side, product_id and price'}, {}, null);
    }
    if (!this.connected) {
      return callback({message: 'ERROR NO CONNECTION'}, {}, null);
    }
    params.type = params.type || 'limit';

    switch (params.type) {
      case 'limit':
        return callback(null, {}, {
          id: 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2',
          price: '0.10000000',
          size: '0.01000000',
          product_id: 'BTC-USD',
          side: 'buy',
          stp: 'dc',
          type: 'limit',
          time_in_force: 'GTC',
          post_only: false,
          created_at: '2016-12-08T20:02:28.53864Z',
          fill_fees: '0.0000000000000000',
          filled_size: '0.00000000',
          executed_value: '0.0000000000000000',
          status: 'pending',
          settled: false
        });
        break;
      case 'market':
        return callback(null, {}, {
          id: 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2',
          price: '0.10000000',
          size: '0.01000000',
          product_id: 'BTC-USD',
          side: 'buy',
          stp: 'dc',
          type: 'market',
          time_in_force: 'GTC',
          post_only: false,
          created_at: '2016-12-08T20:02:28.53864Z',
          fill_fees: '0.0250000000000',
          filled_size: '0.01000000',
          executed_value: '0.100000000000',
          status: 'filled',
          settled: false
        });
        break;
    }
  }
}

Gdax.WebsocketClient = function(products=[], uri='wss://test.mock.com', credentials={}, options={}) {
  this.auth = credentials
  this.socket = {readyState: 0}
  this.channels = get(options, 'channels', []).concat(['heartbeat']);

  let tradeId = 100000000;
  // emit fake test messages every 600ms
  whilst(() => tradeId < 100000010, (cb) => {
    this.emit('message', { type: 'ticker',
    sequence: 5560214656,
    product_id: 'BTC-USD',
    price: '7155.80000000',
    open_24h: '6604.33000000',
    volume_24h: '18682.08960534',
    low_24h: '7155.80000000',
    high_24h: '7200.00000000',
    volume_30d: '592512.25034351',
    best_bid: '7155.14',
    best_ask: '7155.8',
    side: 'buy',
    time: '2018-03-31T16:53:07.051000Z',
    trade_id: ++tradeId,
    last_size: '0.10405984' });
    setTimeout(cb, 600);
  }, (err) => { return; } );

  // emit fake test heartbeats every 1s
  whilst(() => tradeId < 100000010, (cb) => {
    this.emit('heartbeat', { type: 'heartbeat',
    last_trade_id: tradeId,
    product_id: 'BTC-USD',
    sequence: 5560338726,
    time: new Date().toISOString() });
    setTimeout(cb, 1000);
  }, (err) => { return; } );
}
Gdax.WebsocketClient.prototype = new EventEmitter();

module.exports = Gdax;
