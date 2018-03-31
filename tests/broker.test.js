const Broker = require('../src/broker');

describe('Broker class testing', () => {

  describe('Test Broker construction', () => {

    test('instance of Broker class will have exchange and valid properties', () => {
      const broker = new Broker();
      expect(broker).toHaveProperty('exchange');
      expect(broker).toHaveProperty('valid');
    });

    test('instance of Broker class will not be valid if nothing is passed to it', () => {
      const broker = new Broker();
      expect(broker.valid).toBe(false);
    });

    test('instance of Broker class will be valid if exchange instance is passed to its constructor', () => {
      const Exchange = require('../src/exchange');
      const broker = new Broker()
    });
  });
});

