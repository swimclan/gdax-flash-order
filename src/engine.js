const Process = require('./process');
const {EventEmitter} = require('events');

/**
 * A class that represents a limit order execution engine
 */
class Engine {
  /**
   * Constructor for instances of Engine class
   * @param {number} timing - The number of loop iterations per execution
   * @return {void}
   */
  constructor(timing=10000) {
    this.timing = timing;
    this.started = false;
  }

  /**
   * A method that starts the iterator
   @public
   @return {boolean} A boolean value denoting the successful execution of the engine start
   */
  start(processes) {
    if (typeof processes === 'undefined' || !processes) {
      return false;
    }
    this.started = true;
    this._run(processes);
    return true;
  }

  /**
   * A method to stop the engine and halt all process iteration
   * @public
   * @return {boolean} A false boolean value representing the new started state of the engine instance
   */
  stop() {
    return this.started = false;
  }

  /**
   * A method that does nothing.
   * @private
   * @return {Void}
   */
  _noop() {
    return null;
  }

  /**
   * 
   * A method to iterate the engine and run the processes according to the engine timing
   * @private
   * @param {Process[]} processes - A collection of process functions to be executed in the engine
   * @return {boolean} A boolean denoting the successful dispatching of the iterator
   * 
   */
  _run(processes) {
    setTimeout(() => {
      if (this.started) {
        this._executeProcesses(processes);
        this._run(processes);
      } else {
        this._noop();
      }
    }, this.timing);
    return true;
  }
  
  /**
   * A method to execute the each process function of the Engine instance
   * @private
   * @param {function[]} processes - A list of process functions to be called
   * @return {boolean} A boolean denoting if the processes were successfully executed
   */
  _executeProcesses(processes) {
    processes.forEach(async process => {
      await process.fn.apply(process.context, process.args)
    });
  }
}

module.exports = Engine;