# Changelog
All notable changes to this project will be documented in this file.


## [Unreleased]

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