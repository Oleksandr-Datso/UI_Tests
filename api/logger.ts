var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "all";

module.exports.loggerToExport = logger; //identical to module.exports = { logger: logger }