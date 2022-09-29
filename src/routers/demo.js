const { demoController } = require("../controllers/demo");

const demoRouter = require("express").Router();
// JSON request handler
demoRouter.get("/json", demoController.getFetchQueryJSON);

// XML request handler
demoRouter.get("/xml", demoController.getFetchQueryXML);

module.exports = demoRouter;
