const tools = require('../utility')

async function handleError(err, req, res, next) {
    let return_error = {}
    let source = req.source
    return_error["error_sender"] = err.name;
    return_error["error_message"] = err.message;
    await tools.logEntry(source, err.message, err.name);
  res.status(400).send(return_error);
};
 
module.exports = handleError; 