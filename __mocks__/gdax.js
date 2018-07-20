'use strict';
const {get, has} = require('lodash');
const Gdax = jest.genMockFromModule('gdax');
const {EventEmitter} = require('events');
const {whilst} = require('async');

let orders = ['68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08', 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2'];
let cancelled = [];
let unknownOrders = ['h4837hf7-19nv-7722-of38-jfq9n2js0knv'];

function makeid() {
  var text = "";
  var possible = "abcdef0123456789";
  var segSizes = [8, 4, 4, 4, 12];
  for (var seg = 0; seg < 5; seg++) {
    for (var i = 0; i < segSizes[seg]; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    text += '-';
  }
  return text.slice(0, -1);
}

class AuthenticatedClient {
  constructor(key, secret, passphrase, apiURI, options = {}) {
    this.key = key;
    this.secret = secret;
    this.passphrase = passphrase;
    this.connected = true;
  
    this._connection = function(state) {
      return this.connected = state === true;
    }
  }

  getProducts(callback) {
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

  getOrder(orderId, callback) {
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

  cancelOrder(orderId, callback) {
    const unknownOrder = unknownOrders.indexOf(orderId);
    if (unknownOrder !== -1 || orderId === null) {
      return callback({message: 'Invalid orderId supplied.  Order not found.'}, {}, null);
    }
    if (cancelled.indexOf(orderId) !== -1) {
      return callback({message: 'Invalid orderId supplied.  Order already cancelled'}, {}, null);
    }
    cancelled.push(orderId);
    return callback(null, {}, [orderId]);
  }

  placeOrder(params, callback) {
    if (!has(params, 'product_id') || !has(params, 'size') || !has(params, 'side')) {
      return callback({message: 'Invalid params supplied.  Must supply size, side, product_id and price'}, {}, null);
    }
    if (!this.connected) {
      return callback({message: 'ERROR NO CONNECTION'}, {}, null);
    }
    params.type = params.type || 'limit';

    switch (params.type) {
      case 'limit':
        const placedOrder = {
          id: makeid(),
          price: '0.10000000',
          size: params.size.toString(),
          product_id: params.product_id,
          side: params.side,
          stp: 'dc',
          type: 'limit',
          time_in_force: 'GTC',
          post_only: false,
          created_at: new Date().toISOString(),
          fill_fees: '0.0000000000000000',
          filled_size: '0.00000000',
          executed_value: '0.0000000000000000',
          status: 'pending',
          settled: false
        };
        return callback(null, {}, placedOrder);
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

class WebsocketClient extends EventEmitter {
  constructor(productIDs=[], uri='wss://test.mock.com', credentials={}, options={}) {
    super();
    this.auth = credentials
    this.socket = {readyState: 0}
    this.channels = get(options, 'channels', []).concat(['heartbeat']);
    this.productIDs = productIDs;
    this.broadcastSocket();
  }

  broadcastSocket() {
    let tradeId = 100000000;
    let sequence = 5560338726;
    let price = 710.20;

    // emit fake test messages every 200ms
    whilst(() => tradeId < 100000200, (cb) => {
      tradeId++;
      sequence++;
      price += 0.01;  
      this.productIDs.forEach((product, i) => {
        const filledOrderId = makeid();
        this.emit('message',
        {
          type: 'match',
          trade_id: tradeId,
          sequence: 50,
          maker_order_id: filledOrderId,
          taker_order_id: '132fb6ae-456b-4654-b4e0-d681ac05cea1',
          time: new Date().toISOString(),
          product_id: product,
          size: 5.23512,
          price: 6534.02000000,
          side: 'sell'
        });
        this.emit('message',
        {
          type: 'done',
          side: 'buy',
          order_id: filledOrderId,
          reason: 'filled',
          product_id: product,
          price: '6534.02000000',
          remaining_size: '0.00000000',
          sequence: 27914079,
          user_id: '565e2e39d74c2f42f0000083',
          profile_id: 'b42d9b04-b26a-4871-95be-dd9960ea770a',
          time: new Date().toISOString() 
        });
      });
      setTimeout(() => cb(null, ++tradeId), 200)
    }, (err) => { return; } );
  
    // emit fake test heartbeats every 1s
    whilst(() => tradeId < 100000200, (cb) => {
      this.productIDs.forEach(product => {
        this.emit('heartbeat',
        {
          type: 'heartbeat',
          last_trade_id: tradeId,
          product_id: product,
          sequence: sequence,
          time: new Date().toISOString()
        });
      });
      setTimeout(() => cb(null, tradeId), 1000);
    }, (err) => { return; } );
  }
}

module.exports = { AuthenticatedClient, WebsocketClient };
