describe('Testing utils', () => {
  describe('Testing average()', () => {
    const {average} = require('../src/utils');
    
    test('average() should return 13 if [12, 13, 14] is passed to it', () => {
      expect(average([12, 13, 14])).toBe(13);
    });
    test('average() should return 22 if 20, 22, 24 are passed to it as arguments', () => {
      expect(average(20, 22, 24)).toBe(22);
    });

    test('average() should return 4.5 if 2, 3, 4, 5, 6, 7 are passed to it as arguments', () => {
      expect(average(2, 3, 4, 5, 6, 7)).toBe(4.5);
    });

    test('average() should return null if nothing is passed to it', () => {
      expect(average()).toBeNull();
    });

    test('average() should return null if a string is passed to it that is not a number', () => {
      expect(average('Hello')).toBeNull();
    });

    test('average() should return 55 if ["53", "55", "57"]', () => {
      expect(average(['53', '55', '57'])).toBe(55);
    });

    test('average() should return 3.5 if "1", "2", "3", "4", "5", "6" are passed to it as arguments', () => {
      expect(average('1', '2', '3', '4', '5', '6')).toBe(3.5);
    });

    test('average() should return 4 if [1, 3, 5], 7 are passed to it as arguments', () => {
      expect(average([1, 3, 5], 7)).toBe(4);
    });

    test('average() should return 25 if 21, 23, 25, [27], [29] are passed to it as arguments', () => {
      expect(average(21, 23, 25, [27], [29])).toBe(25);
    });

    test('average() should return 20 if 18, [19], 20, [21], 22 are passed in as arguments', () => {
      expect(average(18, [19], 20, [21], 22)).toBe(20);
    });
    
    test('average() should return 43 if [40, 41, "hello", 42, 43], 44, [45, 46] is passed to it as arguments', () => {
      expect(average([40, 41, 'hello', 42, 43], 44, [45, 46])).toBe(43);
    });
  });

  describe('Testing validateProduct()', () => {
    const {validateProduct} = require('../src/utils');

    test('validateProduct() should return false if nothing is passed to it', () => {
      expect(validateProduct()).toBe(false);
    });

    test('validateProduct() should return false if a number is provided', () => {
      expect(validateProduct(34)).toBe(false);
    });

    test('validateProduct() should return false if an array is provided', () => {
      expect(validateProduct(['ETH', 'USD'])).toBe(false);
    });

    test ('validateProduct() should return false if an object is provided', () => {
      expect(validateProduct({source: 'ETH', target: 'USD'})).toBe(false);
    });

    test('validateProduct() should return false if string is provided that is not 7 characters long', () => {
      expect(validateProduct('ETHER-USD')).toBe(false);
    });

    test('validateProduct() should return false if there are no hyphens in the input string', () => {
      expect(validateProduct('ETH/USD')).toBe(false);
    });
    
    test('validateProduct() should return false if the 4th character in input is not a hyphen', () => {
      expect(validateProduct('ET-HUSD')).toBe(false);
    });

    test('validateProduct() should return false if there is more than one hyphen in the input string', () => {
      expect(validateProduct('ET--USD'))
    });

    test('validateProduct() should return false if characters 1 thru 3 are not uppercase letters', () => {
      expect(validateProduct('eth-USD')).toBe(false);
    });

    test('validateProduct() should return false if characters 5 thru 7 are not uppercase letters', () => {
      expect(validateProduct('ETH-usd')).toBe(false);
    });

    test('validateProduct() should be a Boolean true if product is well-formed', () => {
      expect(validateProduct('ETH-USD')).toBe(true);
    });
  });

  describe('Test sortPrices() ...', () => {
    const {sortPrices} = require('../src/utils');
    test('sortPrices() will throw a TypeError if no prices are passed in', () => {
      expect(() => sortPrices()).toThrow(TypeError);
    });
    test('sortPrices() will sort price tuples by price from lowest to highest', () => {
      const prices = [['6002.14', '1.234876'], ['6001.77', '0.2876222'], ['6001.88', '4.2953772']];
      expect(sortPrices(prices)).toEqual([ [ '6001.77', '0.2876222' ], [ '6001.88', '4.2953772' ], [ '6002.14', '1.234876' ] ]); 
    });
  });
});
