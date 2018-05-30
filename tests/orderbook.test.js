const Orderbook = require('../src/orderbook');

describe('Orderbook constructor... ', () => {
  let orderbook;
  afterEach(() => {
    // reset orderbook
    orderbook = undefined;
  });
  test('creates an Orderbook instance with product and book properties.', () => {
    const ethereum = 'ETH-USD';
    orderbook = new Orderbook(ethereum);
    expect(orderbook).toHaveProperty('product', ethereum);
    expect(orderbook).toHaveProperty('book', { bid: 0, ask: 0});
  });

  test('sets the product property to the string passed to the constructor.', () => {
    const bitcoin = 'BTC-USD';
    orderbook = new Orderbook(bitcoin);
    expect(typeof orderbook.product).toBe('string');
    expect(orderbook.product).toBe(bitcoin);
  });
});

describe('Orderbook update method... ', () => {
  let orderbook;
  beforeEach(() => {
    orderbook = new Orderbook('BTC-USD');
  });

  test('takes an object with bid and ask properties as a parameter and updates the orderbook.', () => {
    const params = { bid: 12, ask: 15 };
    orderbook.update(params);
    expect(orderbook.book).toEqual(params);
  });

  test('takes an object with only a bid property as a parameter and updates the orderbook.', () => {
    const params = { bid: 12 };
    orderbook.update(params);
    expect(orderbook.book).toEqual({ bid: 12, ask: 0 });
  });

  test('takes an object with only an ask property as a parameter and updates the orderbook.', () => {
    const params = { ask: 12 };
    orderbook.update(params);
    expect(orderbook.book).toEqual({ bid: 0, ask: 12 });
  });

  test('throws an error if ask is not a number', () => {
    expect(() => {
      orderbook.update({ ask: 'string' });
    })
    .toThrowError(new TypeError('Ask parameter is not a number'));
  })

  test('throws an error if bid is not a number', () => {
    expect(() => {
      orderbook.update({ bid: 'string' });
    })
    .toThrowError(new TypeError('Bid parameter is not a number'));
  })
});
