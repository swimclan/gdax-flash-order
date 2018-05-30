# Changelog
All notable changes to this project will be documented in this file.


## [Unreleased]

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