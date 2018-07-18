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
      expect(orderbook).toHaveProperty('book', { bid: {}, ask: {}});
    });

    test('sets the product property to the string passed to the constructor.', () => {
      const bitcoin = 'BTC-USD';
      orderbook = new Orderbook(bitcoin);
      expect(typeof orderbook.product).toBe('string');
      expect(orderbook.product).toBe(bitcoin);
    });
  });

  describe('L2 Orderbook update method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    test('takes an object with bid and ask objects that have price/volume key value pairs and updates the orderbook.', () => {
      const params = { bid: { 12: 12.34 }, ask: { 15: 123.45 } };
      orderbook.update(params);
      expect(orderbook.book).toEqual(params);
    });

    test('takes an object with only a bid object as a parameter and updates the orderbook.', () => {
      const params = { bid: { 12: 34 } };
      orderbook.update(params);
      expect(orderbook.book).toEqual({ bid: { 12: 34 }, ask: {} });
    });

    test('takes an object with only an ask property as a parameter and updates the orderbook.', () => {
      const params = { ask: { 12: 34 } };
      orderbook.update(params);
      expect(orderbook.book).toEqual({ bid: {}, ask: { 12: 34 } });
    });

    test('throws an error if ask is not an object', () => {
      expect(() => {
        orderbook.update({ ask: 'string' });
      })
      .toThrowError(new TypeError('Ask parameter is not an object'));
    })

    test('throws an error if bid is not an object', () => {
      expect(() => {
        orderbook.update({ bid: 'string' });
      })
      .toThrowError(new TypeError('Bid parameter is not an object'));
    })
  });

  describe('L2 Orderbook getPrice Method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    afterEach(() => {
      orderbook = null;
    })

    test('returns bid data for a price in the orderbook', () => {
      orderbook.update({bid: { 12: 34 }});
      const result = orderbook.getPrice(12);
      expect(result).toEqual({
        side: 'bid',
        price: 12,
        size: 34,
      });
    });

    test('returns ask data for a price in the orderbook', () => {
      orderbook.update({ask: { 12: 34 }});
      const result = orderbook.getPrice(12);
      expect(result).toEqual({
        side: 'ask',
        price: 12,
        size: 34,
      });
    });

    test('returns null if the price is not in the orderbook', () => {
      orderbook.update({ask: { 12: 34 }});
      const result = orderbook.getPrice(14);
      expect(result).toEqual(null);
    });

    test('throws an error if the price is not set or not a number', () => {
      expect(() => {
        orderbook.getPrice();
      })
      .toThrowError(new TypeError('L2 Orderbook price is not a valid number'));

      expect(() => {
        orderbook.getPrice('12');
      })
      .toThrowError(new TypeError('L2 Orderbook price is not a valid number'));
    });
  });

  describe('L2 Orderbook getBestPrices Method... ', () => {
    let orderbook;
    beforeEach(() => {
      orderbook = new Orderbook('BTC-USD');
    });

    afterEach(() => {
      orderbook = null;
    })

    test('returns best bid and data in the orderbook', () => {
      orderbook.update({ bid: { 12: 34, 45: 67 }, ask: { 89: 1011, 1213: 1415 }});
      const result = orderbook.getBestPrices();
      expect(result).toEqual({
        bid: {
          price: 45,
          size: 67,
        },
        ask: {
          price: 89,
          size: 1011,
        },
      });
    });

    test('returns null data if no bids or asks exist in the orderbook', () => {
      const result = orderbook.getBestPrices();
      expect(result).toEqual({
        bid: null,
        ask: null,
      });
    });
  });
});
