module.exports.average = function() {
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

module.exports.validateProduct = function(product) {
  if (arguments.length === 0) {
    return false;
  }
  if (typeof product !== 'string') {
    return false;
  }
  return Boolean(product.match(/^[A-Z]{3}\-[A-Z]{3}$/)) || false;
}
