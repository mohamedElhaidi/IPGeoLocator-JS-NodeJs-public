const { apiConroller } = require("../../controllers/api/api");
const { demoController } = require("../../controllers/demo");

const apiRouter = require("express").Router();

apiRouter.get("/json/:address",demoController.getFetchQueryJSON, apiConroller.getJsonApi);
apiRouter.get("/xml/:address",demoController.getFetchQueryXML, apiConroller.getXMLApi);
apiRouter.get("/csv/:address",demoController.getFetchQueryCSV, apiConroller.geCSVApi);
apiRouter.get("/line/:address",demoController.getFetchQueryNL, apiConroller.getNLApi);

module.exports = apiRouter;
