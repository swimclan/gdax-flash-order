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
