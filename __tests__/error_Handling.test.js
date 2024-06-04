// Testing request error handling:
//1. Correct Error Details: Verifies the middleware sets error details in the response and logs the error correctly.
//2. Error Without Source: Ensures the middleware handles a missing req.source and logs the error appropriately.
//3. Error Without Name and Message: Tests the middleware's response and logging when the error object lacks name and message properties.

const handleError = require('../middleware/errorHandling');
const tools = require('../utility');

jest.mock('../utility');

describe('handleError Middleware', () => {
  let req, res, next, err;

  beforeEach(() => {
    req = {
      source: 'test-source'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
    err = {
      name: 'TestError',
      message: 'This is a test error'
    };
  });

  it('should set the correct error details in the response and log the error', async () => {
    await handleError(err, req, res, next);

    expect(tools.logEntry).toHaveBeenCalledWith(req.source, err.message, err.name);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_sender: err.name,
      error_message: err.message
    });
  });

  it('should handle an error without a source in the request', async () => {
    req.source = undefined;

    await handleError(err, req, res, next);

    expect(tools.logEntry).toHaveBeenCalledWith(undefined, err.message, err.name);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_sender: err.name,
      error_message: err.message
    });
  });

  it('should handle an error without a name and message', async () => {
    err = {};

    await handleError(err, req, res, next);

    expect(tools.logEntry).toHaveBeenCalledWith(req.source, undefined, undefined);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_sender: undefined,
      error_message: undefined
    });
  });
});
