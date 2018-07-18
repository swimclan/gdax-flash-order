# Changelog
All notable changes to this project will be documented in this file.


## [Unreleased]

## [0.2.3] - 2018-07-19
### Added
- Level 2 Order book capabiity

## [0.2.2] - 2018-07-13
### Added
- Support for partially filled orders

## [0.2.1] - 2018-07-08
### Added
- Increased engine speed to 20ms
- Guard against multiple order placements due to race condition with faster engine

## [0.2.0] - 2018-07-08
### Added
- Dispatch engine processes
- Initial filled order handler
- Guards agains zero value limit order price

## [0.1.2] - 2018-06-16
### Added
- Added Engine class for iterating order processes
- Added a Process wrapper for functions being passed to the Engine

## [0.1.1] - 2018-06-12
### Added
- Added cancelOrders() method on broker to cancel orders whose limit price differs from the best price on the orderbook

## [0.1.0] - 2018-06-09
### Added
- Removed circular dependency between broker and exchange
- Added placeOrders method on broker to initiate placing new orders from the queue
- Updated the mock placeOrder method on gdax with synthetic order data
- Made a single socket model for all products including updated dispatchOrderBookUpdater to use single socket
- Updated mock socket client to emit for all products
- Killed _closeFeeds method because it was stupid
- Killed Feeds class because it was totally unneeded in a single socket world

## [0.0.20] - 2018-06-08
### Added
- Added dispatch order book updater method to set socket event listeners for order book updates

## [0.0.19] - 2018-06-06
### Added
- Exchange build method for setting up new exchanges with feeds and data
- Orderbooks property on exchange instance to house live level 1 order books

## [0.0.18] - 2018-05-29
### Added
- Smarter websocket mocking for unit testing gdax feeds
- Cleaned up unit test suites that didnt have root describe blocks

## [0.0.17] - 2018-05-29
### Added
- Better enable and disable method names on broker
- 100% coverage on exchange class

## [0.0.16] - 2018-05-29
### Added
- Orderbook and orderbook update methods plus tests

## [0.0.15] - 2018-05-29
### Added
- Updated mock module for gdax to use ES6 class instead of ES5 constructor functions
- Added tests for websocket emitting from the feeds property on exchange

## [0.0.14] - 2018-05-28
### Added
- Called _loadFeeds() from Exchange constructor to automatically setup all supported feed instances on Exchange startup

## [0.0.13] - 2018-05-28
### Added
- getProducts() wrapper for the GDAX method of retrieving all supported products
- _loadFeeds() method on exchange class to automatically load all supported product feeds on GDAX
- Removed _loadFeed() invocation on the broker processQueue() method in lieu of exchange automatically loading all supported product feeds

## [0.0.12] - 2018-05-27
### Added
- Removed the requirement for supplying limit or market order types on order creation
- Added setLimit() function to Order class for the broker to be able to manage the current limit price of any order in the market

## [0.0.11] - 2018-05-26
### Added
- Made enable and disable functions public in Broker
- Added processQueue invocation in queueOrder with tests

## [0.0.10] - 2018-05-26
### Added
- Feeds and Orderbook class to manage socket feeds and level 1 orderbook for the broker

## [0.0.9] - 2018-05-25
### Added
- Broker enabled and processQueue functions and tests

## [0.0.8] - 2018-05-24
### Added
- Broker order queue and unit tests
- Exchange websocket feeds collection with loader and closer with tests

## [0.0.7] - 2018-03-31
### Added
- Mock websocket events for heartbeat and ticker messages
- Broker implementation in exchange constructor

## [0.0.6] - 2018-03-31
### Fixed
- Exchange constructor takes credentials hash instead of full gdax client so both socket and auth client can be created

### Added
- Initial Broker class

## [0.0.5] - 2018-03-15
### Added
- Cancel order method in Exchange class and unit tests

## [0.0.4] - 2018-03-14
### Added
- Place order method in Exchange class and unit tests

## [0.0.3] - 2018-03-13
### Fixed
- Order instance checking in getOrders method in exchange class

## [0.0.2] - 2018-03-12
### Added
- setStatus method on orders and getOrders on exchange and unit tests

## [0.0.1] - 2018-03-11
### Added
- Initial utils, order and exchange modules with unit tests