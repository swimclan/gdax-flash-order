const Orderbook = require('../src/orderbookL2');

describe('Test L2 Orderbook class', () => {

  describe('L2 Orderbook constructor... ', () => {
    let orderbook;
    afterEach(() => {
      // reset orderbook
      orderbook = undefined;
    });
    test('creates an Orderbook instance with product and book properties.', () => {
      const ethereum = 'ETH-USD';
      orderbook = new Orderbook(ethereum);
      expect(orderbook).toHaveProperty('product', ethereum);
      expect(orderbook).toHaveProperty('book', { bids: [], asks: []});
    });

    test('sets the product property to the string passed to the constructor.', () => {
      const bitcoin = 'BTC-USD';
      orderbook = new Orderbook(bitcoin);
      expect(typeof orderbook.product).toBe('string');
      expect(orderbook.product).toBe(bitcoin);
    });
  });

  describe('L2 Orderbook init() method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    test('init() will throw a TypeError if nothing is passed to it', () => {
      expect(() => orderbook.init()).toThrow(TypeError);
    });

    test('init() will throw a TypeError if something other than an object is passed to it', () => {
      expect(() => orderbook.init('prices and things')).toThrow(TypeError);
    });

    test('init() will throw a TypeError if a message object is passed in whose type property is not \'snapshot\'', () => {
      const invalidMessage = {
        type: 'l2update',
        product_id: 'BTC-USD',
        changes: [
            ['buy', '6500.09', '0.84702376'],
            ['sell', '6507.00', '1.88933140'],
            ['sell', '6505.54', '1.12386524'],
            ['sell', '6504.38', '0']
        ]
      };
      expect(() => orderbook.init(invalidMessage)).toThrow(TypeError);
    });

    test('init() will return false if a message object with a different product signature than the instance product property is passed in', () => {
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-EUR',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      const init = orderbook.init(snapshot);
      expect(init).toBe(false);
      expect(orderbook.book.bids.length).toEqual(0);
      expect(orderbook.book.asks.length).toEqual(0);
    });

    test('If a valid snapshot message is passed into init() the orderbook book property will be updated with the bids and asks from the snapshot and the method will return true', () => {
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      const init = orderbook.init(snapshot);
      expect(orderbook.book['bids'][0]).toEqual(['6500.11', '0.45054140']);
      expect(init).toBe(true);
    });
  });

  describe('L2 Orderbook update() method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    test('update() will throw a Type Error if nothing is passed to it', () => {
      expect(() => orderbook.update()).toThrow(TypeError);
    });

    test('update() will throw if something other than an object is passed to it', () => {
      expect(() => orderbook.update('Prices and updated')).toThrow(TypeError);
    });

    test('update() will throw a TypeError if a message object is passed with a type property other than \'l2update\'', () => {
      const invalidMessage = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      expect(() => orderbook.update(invalidMessage)).toThrow(TypeError);
    });

    test('update() will return false if a message with a different product signature than the instance product property is passed in', () => {
      const updateMessage = {
        type: 'l2update',
        product_id: 'BTC-EUR',
        changes: [
            ['buy', '6500.09', '0.84702376'],
            ['sell', '6507.00', '1.88933140'],
            ['sell', '6505.54', '1.12386524'],
            ['sell', '6504.38', '0']
        ]
      };
      expect(orderbook.update(updateMessage)).toBe(false);
    });

    test('update() will replace/add bids and asks that are onthe orderbook at the supplied price and side', () => {
      const updateMessage = {
        type: 'l2update',
        product_id: 'BTC-USD',
        changes: [
            ['buy', '6500.09', '0.84702376'],
            ['sell', '6500.15', '1.88933140'],
            ['sell', '6505.54', '1.12386524'],
            ['sell', '6504.38', '0']
        ]
      };
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      orderbook.init(snapshot);
      orderbook.update(updateMessage);
      expect(orderbook.book.bids.filter(bid => bid[0] === '6500.09').length > 0).toBe(true);
      expect(orderbook.book.asks.filter(ask => ask[0] === '6500.15' && ask[1] === '1.88933140').length > 0).toBe(true);
    });
  });

  describe('_updateItems() method testing ... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    afterEach(() => {
      orderbook = null;
    });

    test('If nothing is passed to _updateItems() it will throw a TypeError', () => {
      expect(() => orderbook._updateItems()).toThrow(TypeError);
    });

    test('_updateItems() will throw TypeError if something other than an array is passed in', () => {
      expect(() => orderbook._updateItems('Prices and things')).toThrow(TypeError);
    });

    test('_updateItems() will update the book with the changes specified in the passed in changes array', () => {
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }

      const changes = [
        ['buy', '6500.09', '0.84702376'],
        ['sell', '6507.00', '1.88933140'],
        ['sell', '6505.54', '1.12386524'],
        ['sell', '6504.38', '0']
      ];
      orderbook.init(snapshot);
      orderbook._updateItems(changes);
      expect(orderbook.book.bids.filter(bid => bid[0] === '6500.09').length > 0).toBe(true);
    });

  })

  describe('L2 Orderbook getPrice() method ... ', () => {
    let orderbook;
    beforeEach(() => {
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      orderbook = new Orderbook('BTC-USD');
      orderbook.init(snapshot);
    });

    afterEach(() => {
      orderbook = null;
    });

    test('getPrice() will throw a TypeError if nothing is passed in', () => {
      expect(() => orderbook.getPrice()).toThrow(TypeError);
    });

    test('getPrice() will throw a TypeError if something other than a number is passed in', () => {
      expect(() => orderbook.getPrice('this is a price')).toThrow(TypeError);
    });

    test('getPrice() will return the [side, price, size] tuple for the price value that is passed if it is on the orderbook', () => {
      expect(orderbook.getPrice(6500.11)).toEqual(['bid', 6500.11, 0.45054140]);
      const updateMessage = {type: 'l2update', product_id: 'BTC-USD', changes: [['sell', '6500.09', '0.84702376']]};
      orderbook.update(updateMessage);
      expect(orderbook.getPrice(6500.09)).toEqual(['ask', 6500.09, 0.84702376]);
    });

    test('getPrice() will return false if the price is not found on the orderbook', () => {
      expect(orderbook.getPrice(6500.12)).toBeNull();
    });
  });

  describe('L2 Orderbook getBestPrices Method... ', () => {
    let orderbook;
    beforeEach(() => {
      const snapshot = {
        type: 'snapshot',
        product_id: 'BTC-USD',
        bids: [['6500.11', '0.45054140']],
        asks: [['6500.15', '0.57753524']]
      }
      orderbook = new Orderbook('BTC-USD');
      orderbook.init(snapshot);
    });

    afterEach(() => {
      orderbook = null;
    });

  });
});
