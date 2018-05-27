const Orderbook = require('../src/orderbook');
const Feeds = require('../src/feeds');

describe('Test Orderbook construction', () => {
  let orderbook;
  beforeEach(() => {
    orderbook = new Orderbook();
  })
  test('new Orderbook constructed without any params will set an empty feeds instance to its feeds prop', () => {
    expect(orderbook.feeds instanceof Feeds).toBe(true);
  });

  test('new Orderbook instance will have feeds and book properties', () => {
    expect(orderbook).toHaveProperty('feeds');
    expect(orderbook).toHaveProperty('book', { bids: [], asks: [] });
  });
});
