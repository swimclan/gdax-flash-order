'use strict';
const {get, has} = require('lodash');
const Gdax = jest.genMockFromModule('gdax');
const {EventEmitter} = require('events');
const {whilst} = require('async');

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

class WebsocketClient extends EventEmitter {
  constructor(productIDs=[], websocketURI='wss://test.mock.com', credentials={}, options={}) {
    super();
    this.auth = credentials
    this.socket = {readyState: 0}
    this.channels = get(options, 'channels', []).concat(['heartbeat']);
    this.productIDs = productIDs;
    this.broadcastSocket();
    this.websocketURI = websocketURI;
  }

  broadcastSocket() {
    let tradeId = 100000000;
    let sequence = 5560338726;

    const filledOrderId = makeid();
    setTimeout(() => {
      this.emit('message', {
        "type": "snapshot",
        "product_id": "BTC-USD",
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]],
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2.000435"], ["6500.09", "0.04"], ["6499.99", "0.11112"]]
      });
      this.emit('message', {
        "type": "snapshot",
        "product_id": "ETH-USD",
        "asks": [["650.15", "0.57753524"], ["650.13", "1.948533"], ["650.24", "2.909934"]],
        "bids": [["650.11", "0.45054140"], ["650.03", "2.000435"], ["650.09", "0.04"], ["649.99", "0.11112"]]
      });
      this.emit('message', {
        "type": "snapshot",
        "product_id": "BCH-USD",
        "asks": [["1650.15", "0.57753524"], ["1650.13", "1.948533"], ["1650.24", "2.909934"]],
        "bids": [["1650.11", "0.45054140"], ["1650.03", "2.000435"], ["1650.09", "0.04"], ["1649.99", "0.11112"]]
      });
      this.emit('message', {
        "type": "l2update",
        "product_id": 'BTC-USD',
        "changes": [
          ['buy', '6500.12', '1.02305'],
          ['sell', '6500.13', '0.999913'],
          ['sell', '6500.14', '2.049383'],
          ['buy', '6500.09', '0'],
          ['buy', '6499.99', '10.101001'],
          ['sell', '6507.14', '9.911911']
        ]
      });
      this.emit('message', {
        "type": "l2update",
        "product_id": 'ETH-USD',
        "changes": [
          ['buy', '650.12', '1.02305'],
          ['sell', '650.13', '0.999913'],
          ['sell', '650.14', '2.049383'],
          ['buy', '650.09', '0'],
          ['buy', '649.99', '10.101001'],
          ['sell', '651.14', '9.911911']
        ]
      });
      this.emit('message', {
        "type": "l2update",
        "product_id": 'BCH-USD',
        "changes": [
          ['buy', '1500.12', '1.02305'],
          ['sell', '1500.13', '0.999913'],
          ['sell', '1500.14', '2.049383'],
          ['buy', '1500.09', '0'],
          ['buy', '1499.99', '10.101001'],
          ['sell', '1507.14', '9.911911']
        ]
      });
    }, 100);
    setTimeout(() => {
      this.emit('message',
      {
        type: 'match',
        trade_id: 10,
        sequence: 50,
        maker_order_id: filledOrderId,
        taker_order_id: '132fb6ae-456b-4654-b4e0-d681ac05cea1',
        time: new Date().toISOString(),
        product_id: 'BTC-USD',
        size: 5.23512,
        price: 6534.02000000,
        side: 'sell'
      });
      this.emit('message',
      {
        type: 'done',
        side: 'buy',
        order_id: makeid(),
        reason: 'filled',
        product_id: 'BTC-USD',
        price: '6534.02000000',
        remaining_size: '0.00000000',
        sequence: 27914079,
        user_id: '565e2e39d74c2f42f0000083',
        profile_id: 'b42d9b04-b26a-4871-95be-dd9960ea770a',
        time: new Date().toISOString() 
      });
    }, 200);
  
    // emit fake test heartbeats every 1s
    whilst(() => tradeId < 100000200, (cb) => {
      this.productIDs.forEach(product => {
        this.emit('heartbeat',
        {
          type: 'heartbeat',
          last_trade_id: tradeId++,
          product_id: product,
          sequence: sequence,
          time: new Date().toISOString()
        });
      });
      setTimeout(() => cb(null, tradeId), 1000);
    }, (err) => { return; } );
  }
}

module.exports = { WebsocketClient };
