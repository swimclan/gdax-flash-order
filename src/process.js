class Process {
  constructor(fn, context, args) {
    this.fn = fn;
    this.context = context;
    this.args = args;
    this.valid = Boolean(this.fn && this.context && this.args);
  }
}

module.exports = Process;