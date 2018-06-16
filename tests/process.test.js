const Process = require('../src/process');

describe('Test Process class ...', () => {
  describe('Test Process class construction ...', () => {
    let process, success;
    beforeEach(() => {
      success = jest.fn();
      process = new Process(success, {}, [1, 2, 3]);
    });
    test('When new Process instance is constructed with no params, the instance valid property will be false', () => {
      const process = new Process();
      expect(process).toHaveProperty('valid', false);
    });
    test('When Process instance is constructed with supplied params they are assigned in the new instance properties', () => {
      expect(process).toHaveProperty('fn', success);
      expect(process).toHaveProperty('context', {});
      expect(process).toHaveProperty('args', [1, 2, 3]);
      expect(process).toHaveProperty('valid', true);
    });
  });
});