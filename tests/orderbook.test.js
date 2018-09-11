const Orderbook = require('../src/orderbook');
const Engine = require('../src/engine');
const {createList} = require('../src/utils');

/* Data examples:

{
    "type": "snapshot",
    "product_id": "BTC-EUR",
    "bids": [["6500.11", "0.45054140"]],
    "asks": [["6500.15", "0.57753524"]]
}

{
    "type": "l2update",
    "product_id": "BTC-EUR",
    "changes": [
        ["buy", "6500.09", "0.84702376"],
        ["sell", "6507.00", "1.88933140"],
        ["sell", "6505.54", "1.12386524"],
        ["sell", "6504.38", "0"]
    ]
}

*/

function inList(list, value, atIndex) {
  let current, found = false;
  while (true) {
    !current && (current = list);
    found = current.value[atIndex] === value;
    current = current.next;
    if (found || !current) { break; }
  }
  return found;
}

describe('Test Orderbook class', () => {

  describe('Orderbook constructor... ', () => {
    let orderbook;
    afterEach(() => {
      // reset orderbook
      orderbook = undefined;
    });
    test('Orderbook instance will default product to BTC-USD if nothing is passed to the constructor', () => {
      orderbook = new Orderbook();
      expect(orderbook).toHaveProperty('product', 'BTC-USD');
    });

    test('Orderbook instance will have a product, book and queue property', () => {
      orderbook = new Orderbook('BTC-USD');
      expect(orderbook).toHaveProperty('product', 'BTC-USD');
      expect(orderbook).toHaveProperty('book', {bids: null, asks: null});
      expect(orderbook).toHaveProperty('queue', []);
      expect(orderbook).toHaveProperty('engine');
    });

    test('Orderbook instance engine property will be of type Engine class', () => {
      orderbook = new Orderbook('BTC-USD');
      expect(orderbook.engine instanceof Engine).toBe(true);
    });
  });

  describe('Orderbook init() method... ', () => {
    let orderbook, l2update, snapshot;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
      l2update = {
        "type": "l2update",
        "product_id": "BTC-USD",
        "changes": [
            ["buy", "6500.09", "0.84702376"],
            ["sell", "6507.00", "1.88933140"],
            ["sell", "6505.54", "1.12386524"],
            ["sell", "6504.38", "0"]
        ]
      };
      snapshot = {
        "type": "snapshot",
        "product_id": "BTC-USD",
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2. 000435"], ["6500.09", "0.04"]],
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]]
      }
    });
    test('init() will throw a TypeError if no message is passed in', () => {
      expect(() => orderbook.init()).toThrow(TypeError);
    });
    test('init() will throw a Type Error if a message object is passed in without a type of \'snapshot\'', () => {
      expect(() => orderbook.init(l2update)).toThrow(TypeError);
    });
    test('init() will assign sorted price tuples to the book', () => {
      orderbook.init(snapshot);
      const asksList = createList([ [ '6500.13', '1.948533' ], [ '6500.15', '0.57753524' ], [ '6500.24', '2.909934' ] ]);
      const bidsList = createList([ [ '6500.11', '0.45054140' ], [ '6500.09', '0.04' ], [ '6500.03', '2. 000435' ] ]);
      expect(orderbook.book.asks).toEqual(asksList);
      expect(orderbook.book.bids).toEqual(bidsList);
    });
    test('init() will return false if a message for a product other than the current orderbook product property is passed in', () => {
      snapshot.product_id = 'BTC-EUR';
      expect(orderbook.init(snapshot)).toBe(false);
    });
    test('init() will return true if a snapshot is successfully sorted and assigned to the book', () => {
      expect(orderbook.init(snapshot)).toBe(true);
    });
    test('init() will create a process for applyQueue and start the orderbooks instance\'s engine with it', () => {
      const start = jest.spyOn(Engine.prototype, 'start');
      orderbook.init(snapshot);
      expect(start).toHaveBeenCalledTimes(1);
    });
  });

  describe('queueUpdates() testing ...', () => {
    let orderbook, snapshot, l2update;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
      l2update = {
        "type": "l2update",
        "product_id": "BTC-USD",
        "changes": [
            ["buy", "6500.09", "0.84702376"],
            ["sell", "6507.00", "1.88933140"],
            ["sell", "6505.54", "1.12386524"],
            ["sell", "6504.38", "0"]
        ]
      };
      snapshot = {
        "type": "snapshot",
        "product_id": "BTC-USD",
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2. 000435"], ["6500.09", "0.04"]],
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]]
      };
    });
    test('queueUpdates() will throw TypeError if nothing is passed in', () => {
      expect(() => orderbook.queueUpdates()).toThrow(TypeError);
    });
    test('queueUpdates() will throw TypeError if a message object is passed in of a different type than \'l2update\'', () => {
      expect(() => orderbook.queueUpdates(snapshot)).toThrow(TypeError);
    });
    test('queueUpdates() will push new update price tuples onto the orderbook instance\'s queue array', () => {
      orderbook.queueUpdates(l2update);
      expect(orderbook.queue.length).toEqual(4);
      expect(orderbook.queue[0]).toEqual(["buy", "6500.09", "0.84702376"]);
    });
    test('queueUpdates() will return true if executed successfully', () => {
      expect(orderbook.queueUpdates(l2update)).toBe(true);
    });
  });

  describe('applyQueue() testing ... ', () => {
    let orderbook, snapshot, l2update;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
      snapshot = {
        "type": "snapshot",
        "product_id": "BTC-USD",
        "asks": [["6500.15", "0.57753524"], ["6500.13", "1.948533"], ["6500.24", "2.909934"]],
        "bids": [["6500.11", "0.45054140"], ["6500.03", "2.000435"], ["6500.09", "0.04"]]
      };
      l2update = {
        "type": "l2update",
        "product_id": "BTC-USD",
        "changes": [
          ['buy', '6500.04', '1.02305'],
          ['sell', '6500.13', '0.999913'],
          ['sell', '6500.14', '2.049383'],
          ['buy', '6500.09', '0']
        ]
      };
    });
    test('applyQueue() will expunge the entire queue of changes when successfully executed', () =>{
      orderbook.init(snapshot);
      orderbook.queueUpdates(l2update);
      orderbook.applyQueue()
      expect(orderbook.queue.length).toEqual(0);
    });
    test('applyQueue() will remove a price whose change has a zero size', () => {
      orderbook.init(snapshot);
      orderbook.queueUpdates(l2update);
      orderbook.applyQueue();
      expect(inList(orderbook.book.bids, '6500.09', 0)).toBe(false);
    });
    test('applyQueue() will insert a price if it isnt already there', () => {
      orderbook.init(snapshot);
      expect(inList(orderbook.book.asks, '6500.14', 0)).toBe(false);
      orderbook.queueUpdates(l2update);
      orderbook.applyQueue();
      expect(inList(orderbook.book.asks, '6500.14', 0)).toBe(true);
    });
    test('applyQueue() will remove the lowest ask if a change at that price with size of zero is received', () => {
      orderbook.init(snapshot);
      expect(inList(orderbook.book.asks, '6500.13', 0)).toBe(true);
      const l2update = {
        "type": "l2update",
        "product_id": "BTC-USD",
        "changes": [
          ['sell', '6500.13', '0']
        ]
      };
      orderbook.queueUpdates(l2update);
      orderbook.applyQueue();
      expect(inList(orderbook.book.asks, '6500.13', 0)).toBe(false);
    });
    test('applyQueue() will not run and return false if the orderbook is not completely initialized', () => {
      orderbook.queueUpdates(l2update);
      expect(orderbook.applyQueue()).toBe(false);
    });
    test('applyQueue() will update an existing price level with a new size from update change', () => {
      orderbook.init(snapshot);
      expect(inList(orderbook.book.asks, '6500.13', 0) && inList(orderbook.book.asks, '1.948533', 1)).toBe(true);
      orderbook.queueUpdates(l2update);
      orderbook.applyQueue();
      expect(inList(orderbook.book.asks, '6500.13', 0) && inList(orderbook.book.asks, '1.948533', 1)).toBe(false);
      expect(inList(orderbook.book.asks, '6500.13', 0) && inList(orderbook.book.asks, '0.999913', 1)).toBe(true);
    });
    test('applyQueue() will not run and return false if the queue is empty', () => {
      orderbook.init(snapshot);
      expect(orderbook.applyQueue()).toBe(false);
    });
  });

  describe('Orderbook getBestPrices Method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    afterEach(() => {
      orderbook = null;
    });

  });
});
