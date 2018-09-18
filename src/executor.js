const {get} = require('lodash');
const axios = require('axios');
const {createHmac} = require('crypto');

/**
 * A class that represents an upstream order executor exchange
 */
class Executor {
  /**
   * 
   * @param {object} credentials - An object representing the gdax credentials for constructing a new exchange instance with coinbase pro api
   */
  constructor(credentials={}) {
    this.key = get(credentials, 'key', null);
    this.secret = get(credentials, 'secret', null);
    this.passphrase = get(credentials, 'passphrase', null);
    this.apiURI = process.env.NODE_ENV !== 'production' ? 'https://api-public.sandbox.pro.coinbase.com/' : 'https://api.pro.coinbase.com/';
  }

  /**
   * A private request method that wraps axios instance and handles request authentication
   * @private
   * @param {sting} path - A path to append to the apiURI for http request
   * @param {object} config - A hash of config parameters for http request
   * @param {string} config.url - The path appended to the base url for the request
   * @param {string} config.method - The HTTP verb of the request (ie 'get', 'post', etc)
   * @param {object} config.data - A hash of request body properties for post, put, patch requests
   * @returns {Promise<any>} - A promise that resolves with the http response
   */
  _request({url, method, data}) {
    const timestamp = Math.floor(Date.now() / 1000);
    const client = axios.create({
      baseURL: this.apiURI,
      timeout: 60000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'CB-ACCESS-KEY': this.key,
        'CB-ACCESS-SIGN': this._signSecret(url, timestamp, method, data),
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': this.passphrase
      }
    });
    return client.request({url, method, data});
  }

  /**
   * A method for cryptographically signing the authenticated secret
   * @param {string} requestPath - The path to the specific coinbase api service (ie '/cancel')
   * @param {number} timestamp - UNIX timestamp in seconds
   * @param {string} method - The HTTP verb for the request type being authenticated
   * @param {object} data - Hash of request properties for post, put, patch requests
   */
  _signSecret(requestPath, timestamp, method, data) {
    let preHash = timestamp.toString() + method.toUpperCase() + requestPath;
    data && (preHash += JSON.stringify(data));
    const key = Buffer(this.secret, 'base64');
    const hmac = createHmac('sha256', key);
    return hmac.update(preHash).digest('base64');
  }

  /**
   * A method that executs a buy or sell order on coinbase pro
   * @public
   * @param {object} params - Hash of order params required to execute order on coinbase pro
   * @param {Function} callback - Callback function called when order is either executed successfully or error occurs
   * @returns {void}
   */
  placeOrder(params, callback) {
    this._request({
      url: '/orders',
      method: 'post',
      data: params
    })
    .then(response => callback(null, response, response.data))
    .catch(err => callback(err.message, err, null));
  }

  /**
   * A method that cancels a single order on coinbase pro
   * @public
   * @param {string} orderId - Id of the order being cancelled at coinbase pro
   * @param {*} callback - Callback function called when order is either cancelled or error occurs
   * @returns {void}
   */
  cancelOrder(orderId, callback) {
    this._request({
      url: `/orders/${orderId}`,
      method: 'delete'
    })
    .then(response => callback(null, response, response.data))
    .catch(err => callback(err.message, err, null));
  }

  /**
   * A method that retrieves all active products on coinbase pro (ie BTC-USD, etc)
   * @public
   * @param {Function} callback - Callback function that returns list of active products on exchange or error
   * @returns {void}
   */
  getProducts(callback) {
    this._request({
      url: '/products',
      method: 'get'
    })
    .then(response => callback(null, response, response.data))
    .catch(err => callback(err.message, err, null));    
  }

  /**
   * A method that retrieves all active products on coinbase pro (ie BTC-USD, etc)
   * @public
   * @param {string} orderId - Id of the order being retrieved at coinbase pro
   * @param {Function} callback - Callback function that returns order being requested or error
   * @returns {void}
   */
  getOrder(orderId, callback) {
    this._request({
      url: `/orders/${orderId}`,
      method: 'get'
    })
    .then(response => callback(null, response, response.data))
    .catch(err => callback(err.message, err, null));    
  }
}

module.exports = Executor;