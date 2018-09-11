const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });

module.exports = {
  Order: require('./src/order'),
  Exchange: require('./src/exchange'),
  Broker: require('./src/broker')
}
