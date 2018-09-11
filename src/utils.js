const {Node} = require('./node');

/**
 * Calculate the average of a list of numbers
 * @public
 * @param {(...number|number[])} nums - A spread of numbers of an array of numbers
 * @return {(number|null)} number representing the average of input or null if input is invalid
 */
module.exports.average = function(nums) {
  if (arguments.length === 0) {
    return null;
  }
  let arr = [];
  Object.keys(arguments).forEach(i => {
    if (Array.isArray(arguments[i])) {
      arr = arr.concat(arguments[i]);
    } else {
      arr.push(arguments[i]);
    }
  });
  let set = arr.filter(val => !isNaN(parseFloat(val, 10))).map(val => Number(val));
  return set.length > 0 ? set.reduce((acc, val) => { return acc + val; }, 0) / set.length : null;
}

/**
 * Validate a cryptocurrency pair product string
 * @public
 * @param {string} product - A string representing a cryptocurrency product pair
 * @return {boolean} A boolean representing whether the string is a well-formed crypto currency product pair
 */
module.exports.validateProduct = function(product) {
  if (arguments.length === 0) {
    return false;
  }
  if (typeof product !== 'string') {
    return false;
  }
  return Boolean(product.match(/^[A-Z]{3}\-[A-Z]{3}$/)) || false;
}

/**
 * Sort price tuples from the level2 orderbook snapshot
 * @param {Array[]} prices - A list of price tuples: [[price, size], ...]
 * @param {boolean} reverse - A bool denoting whether to sort in reverse (for bids)
 * @returns {Array} A list of sorted price tuples
 */
module.exports.sortPrices = function(prices, reverse=false) {
  if (!prices || typeof prices === 'undefined' || !Array.isArray(prices)) {
    throw new TypeError('Utils.sortPrices() : An array of price tuples must be passed in');
  }
  return prices.sort((a, b) => {
    return reverse ? Number(a[0]) < Number(b[0]) : Number(a[0]) > Number(b[0]);
  }).slice();
}

/**
 * Create a single linked list data structure from an array
 * @param {Array} arr - An array to be used as the source of the linked list
 * @returns {object} A linked list object with nested nodes
 */
module.exports.createList = function(arr) {
  let i = 0;
  let current, ret;
  while(i < arr.length) {
    if (current) {
      current.next = new Node(arr[i], null);
      current = current.next;
    } else {
      ret = new Node(arr[i], null);
      current = ret;
    }
    i++;
  }
  return ret;
}
