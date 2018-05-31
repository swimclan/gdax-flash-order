const { EventEmitter } = require('events');
const { WebsocketClient } = require('gdax');
const Feeds = require('../src/feeds');

describe('Feeds class testing', () => {

  describe('Test Feeds construction', () => {
    let feeds;
    beforeEach(() => {
      feeds = new Feeds();
    });
    test('There are no feed props on a newly constructed Feeds instance when no params are passed in', () => {
      expect(feeds.length).toBe(0);
    });

    test('Instances of Feeds are EventEmiiters', () => {
      expect(feeds instanceof EventEmitter).toBe(true);
    });

    test('Instances of feeds have a length property that is initialized at 0', () => {
      expect(feeds).toHaveProperty('length', 0);
    });
  });

  describe('Test _getFeeds() functionality', () => {
    beforeEach(() => {
      feeds = new Feeds();
      emit = jest.spyOn(feeds, 'emit');
      product = 'ETH-USD';
      websocketClient = new WebsocketClient([product], 'wss://ws-feed-public.sandbox.gdax.com', {}, { channels: 'ticker' });
    });  
    test('_getFeeds() will return an empty array if no feeds have been added to the instance', () => {
      expect(feeds._getFeeds()).toEqual([]);
    });
    test('_getFeeds(), will return a list of all product feeds that are on the instance', () => {
      feeds.add(product, websocketClient);
      expect(feeds._getFeeds().indexOf(product)).not.toBe(-1);
    });
  });

  describe('Test add() functionality', () => {
    let feeds, websocketClient, product, emit;
    beforeEach(() => {
      feeds = new Feeds();
      emit = jest.spyOn(feeds, 'emit');
      product = 'ETH-USD';
      websocketClient = new WebsocketClient([product], 'wss://ws-feed-public.sandbox.gdax.com', {}, { channels: 'ticker' });
    });
    test('If add is called without any params it will throw a TypeError', () => {
      expect(() => feeds.add()).toThrow(TypeError);
    });
    test('If add() is called without two arguments, it will throw a TypeError', () => {
      expect(() => feeds.add(product)).toThrow(TypeError);
    });
    test('If the first param applied to add() is not a string it will throw a TypeError', () => {
      expect(() => feeds.add(34, websocketClient)).toThrow(TypeError);
    });
    test('if the second param applied to add() is not an instance of the WebsocketClient class it will throw a TypeError', () => {
      expect(() => feeds.add(product, 34)).toThrow(TypeError);
    });
    test('if the first param applied to add() is a string but not a valid crypto product signature, it will throw a TypeError', () => {
      expect(() => feeds.add('ET-USD', websocketClient)).toThrow(TypeError);
    });
    test('When a product string and a feed is applied to add() the length of the Feeds collection will increment by 1', () => {
      expect(feeds.length).toBe(0);
      feeds.add(product, websocketClient);
      expect(feeds.length).toBe(1);
    });
    test('When add() is successfully called with a new feed that was not already on the instance, emit will called with the \'update\' and product string arguments', () => {
      feeds.add(product, websocketClient);
      feeds.add(product, websocketClient);
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toBeCalledWith('update', product);
    });
    test('When add() is called for a product that was not already on the instance true will be returned', () => {
      expect(feeds.add(product, websocketClient)).toBe(true);
    });
    test('when add() is called for a product that is already in the instance false will be returned', () => {
      feeds.add(product, websocketClient);
      expect(feeds.add(product, websocketClient)).toBe(false);
    });
  });

  describe('Test remove() functionality', () => {
    let feeds, emit, product;
    beforeEach(() => {
      feeds = new Feeds();
      product = 'ETH-USD';
      emit = jest.spyOn(feeds, 'emit');
      websocketClient = new WebsocketClient([product], 'wss://ws-feed-public.sandbox.gdax.com', {}, { channels: 'ticker' });
    });
    test('If no arguments are applied to remove() then it will throw a TypeError', () => {
      expect(() => feeds.remove()).toThrow(TypeError);
    });
    test('If remove() is called with an argument that is not a string it will throw a TypeError', () => {
      expect(() => feeds.remove(23)).toThrow(TypeError);
    });
    test('If remove() is called with a string that is not a valid crypto product signature it will throw a TypeError', () => {
      expect(() => feeds.remove('ET-USD')).toThrow(TypeError);
    });
    test('If a valid product signature string is passed to remove() that is not present on the instance, length value will stay the same', () => {
      const prevLength = feeds.length;
      feeds.remove(product);
      expect(prevLength - feeds.length).toBe(0);
    });
    test('If a valid product signature is passed to remove() that is currently in the instance the length property will decrement by one', () => {
      feeds.add(product, websocketClient);
      const prevLength = feeds.length;
      feeds.remove(product);
      expect(prevLength - feeds.length).toBe(1);
    });
    test('If remove() is called with a product signature that is not on the instance, false will be returned', () => {
      expect(feeds.remove(product)).toBe(false);
    });
    test('If remove() is called with a product signature that is on the instance, true will be returned', () => {
      feeds.add(product, websocketClient);
      expect(feeds.remove(product)).toBe(true);
    });
    test('If remove() is successfully called for a product that is already on the instance its emit method will be called with the \'update\' string and a string representing the product signature removed', () => {
      feeds.remove(product, websocketClient);
      feeds.add(product, websocketClient);
      feeds.remove(product, websocketClient);
      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith('update', product);
    });
  });

  describe('Test clear() functionality', () => {
    let feeds, emit, product, websocketClient;
    beforeEach(() => {
      feeds = new Feeds();
      emit = jest.spyOn(feeds, 'emit');
      product = 'ETH-USD';
      websocketClient = new WebsocketClient([product], 'wss://ws-feed-public.sandbox.gdax.com', {}, { channels: 'ticker' });
    });
    test('If clear() is called when instance length property is alredy 0, emit will not be called', () => {
      feeds.clear();
      expect(emit).toHaveBeenCalledTimes(0);
    });
    test('If clear() is called when instance length property is greater than 0 emit will be called with \'update\'', () => {
      feeds.add(product, websocketClient);
      feeds.clear();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith('update');
    });
    test('If clear() is called when the instance length property is already 0, the function will return false', () => {
      expect(feeds.clear()).toBe(false);
    });
    test('If clear() is called when the instance length property is greater than 0, the function will return true', () => {
      feeds.add(product, websocketClient);
      expect(feeds.clear()).toBe(true);
    });
    test('If clear() is called when the instance length property is greater than 0, the length property will reset to 0', () => {
      feeds.add(product, websocketClient);
      feeds.clear();
      expect(feeds.length).toBe(0);
    });
  });
});
