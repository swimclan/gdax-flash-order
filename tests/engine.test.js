const Engine = require('../src/engine');
const Process = require('../src/process');
const Broker = require('../src/broker');
const Exchange = require('../src/exchange');

describe('Engine class testing', () => {
  describe('Engine class construction ...', () => {
    let engine;
    beforeEach(() => {
      engine = new Engine();
    });
    test('Engine class can be constructed with no params passed', () => {
      expect(engine instanceof Engine).toBe(true);
    });
    test('Engine class will have a timing and started property on new instances', () => {
      expect(engine).toHaveProperty('timing', 10000);
      expect(engine).toHaveProperty('started', false);
      expect(engine).toHaveProperty('processes', []);
    });
    test('Engine class instances will have a custom timing value if it is passed into constructor', () => {
      const engine = new Engine(20000);
      expect(engine).toHaveProperty('timing', 20000);
    });
  });

  describe('Test start() method ... ', () => {
    let engine, process, success;
    beforeEach(() => {
      engine = new Engine(500);
      success = jest.fn();
      process = new Process(success, {}, [1, 2, 3]);
    });
    test('start() will return a boolean true when called', () => {
      expect(engine.start([process])).toEqual(true);
    });
    test('if nothing is passed to start(), an empty processes array will be assigned to processes property', () => {
      engine.start();
      expect(engine.processes).toEqual([]);
    });
    test('If start() is called with a list of valid processes they will all be called', (done) => {
      engine.start([process]);
      setTimeout(() => {
        expect(success).toHaveBeenCalledWith(1, 2, 3);
        expect(success).toHaveBeenCalledTimes(2);
        engine.stop();
        done();
      }, 1100);
    });
  });

  describe('Test the stop() method', () => {
    let engine, process, success;
    beforeEach(() => {
      engine = new Engine(500);
      success = jest.fn();
      process = new Process(success, {}, [1, 2, 3]);
    });
    test('Calling stop() will set the started property of the engine instance to false', () => {
      engine.start([process]);
      engine.stop();
      expect(success).toHaveBeenCalledTimes(0);
      expect(engine.started).toBe(false);
    });
  });

  describe('Test the _run() method ...', () => {
    let engine, process, success;
    beforeEach(() => {
      engine = new Engine(500);
      success = jest.fn();
      process = new Process(success, {}, [1, 2, 3]);
    });
    test('Calling the _run() method when the engine is stopped will run noop()', (done) => {
      const engine = new Engine(10);
      const noop = jest.spyOn(engine, '_noop');
      engine._run([process]);
      setTimeout(() => {
        expect(noop).toHaveBeenCalledTimes(1);
        done();
      }, 20);
    });
  });
});