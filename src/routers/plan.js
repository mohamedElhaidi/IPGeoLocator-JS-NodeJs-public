const bodyParser = require("body-parser");
const { planController } = require("../controllers/plan");
const { body } = require("express-validator");
const planRouter = require("express").Router();
const { setPageTitle } = require("../middleware/setTitle");
const { adminController } = require("../controllers/admin");

planRouter.get("/", setPageTitle("Plans"), adminController.getAdminPlansPage);
planRouter.get("/new", setPageTitle("New Plan"), planController.getPlanPage);
planRouter.get(
  "/:id",
  bodyParser.urlencoded(),
  setPageTitle("Viewing"),
  planController.getEditPlanPage
);
planRouter.post(
  "/create",
  bodyParser.urlencoded(),
  body("title").isString(),
  //   body("description").isString(),
  body("price").isNumeric(),
  body("discount").isNumeric(),
  //   body("features")(),
  body("isFree").isBoolean(),
  planController.postCreateAPlan
);
planRouter.post(
  "/update",
  bodyParser.urlencoded(),
  body("title").isString(),
  //   body("description").isString(),
  body("price").isNumeric(),
  body("discount").isNumeric(),
  //   body("features")(),
  body("isFree").isBoolean(),
  planController.putUpdateAPlan
);
planRouter.get("/delete", planController.getDeleteAPlan);

module.exports = planRouter;
