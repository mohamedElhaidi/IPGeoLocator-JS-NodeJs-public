const bodyParser = require("body-parser");
const { apiKeyController } = require("../controllers/apiKey");
const isAuth = require("../middleware/is-auth");
const { setPageTitle } = require("../middleware/setTitle");

const apiKeysRouter = require("express").Router();

apiKeysRouter.get(
  "/newApiKey",
  setPageTitle("New"),
  isAuth,
  apiKeyController.getNewApiKeyPage
);

apiKeysRouter.get(
  "/:id",
  setPageTitle("Main"),
  isAuth,
  apiKeyController.getApiKeyPage
);

apiKeysRouter.get(
  "/:id/history",
  setPageTitle("History"),
  isAuth,
  apiKeyController.getApiKeyHistoryPage
);

apiKeysRouter.post(
  "/create",
  bodyParser.urlencoded({ extended: true }),
  isAuth,
  apiKeyController.postCreateApiKey
);

// apiKeysRouter.get("/:apiKeyId", isAuth, );

module.exports = apiKeysRouter;
