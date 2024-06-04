// Testing logging functionality
// 1.Testing the correct date and time format (YYYY/M/D H:mm).
// 2. Testing if logs are entered correctly

const { currentDate, logEntry } = require('../utility.js');
let loggingDb;

jest.mock('../databases/loggingDatabase.js', () => ({
  createLog: jest.fn()
}));

beforeEach(() => {
  jest.resetModules();
  loggingDb = require('../databases/loggingDatabase.js');
});

describe('currentDate function', () => {
  it('should return the current date and time in the expected format', () => {
    const mockedDate = new Date(2023, 5, 3, 14, 30); // June 3, 2023, 14:30
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate);

    const result = currentDate();

    expect(result).toBe('2023/6/3 14:30');
    global.Date.mockRestore();
  });
});

describe('logEntry function', () => {
  it('should log an entry with the correct parameters', async () => {
    const loggedComponent = 'TestComponent';
    const message = 'Test message';
    const error_sender = 'TestSender';

    const mockedDate = new Date(2023, 5, 3, 14, 30);
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate);

    await logEntry(loggedComponent, message, error_sender);

    expect(loggingDb.createLog).toHaveBeenCalledWith(
      loggedComponent,
      message,
      error_sender,
      '2023/6/3 14:30'
    );

    global.Date.mockRestore();
  });
});