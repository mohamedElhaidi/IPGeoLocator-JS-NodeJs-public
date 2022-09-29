const bodyParser = require("body-parser");
const { body } = require("express-validator");
const { adminUsersController } = require("../../controllers/admin/users");
const { setPageTitle } = require("../../middleware/setTitle");

const adminUsersRouter = require("express").Router();

adminUsersRouter.get(
  "/",
  setPageTitle("Users"),
  adminUsersController.getUsersPge
);
adminUsersRouter.get(
  "/:id",
  setPageTitle("[user]"),
  adminUsersController.getUserPage
);
adminUsersRouter.post(
  "/:id/update",
  bodyParser.urlencoded(),
  body("first_name").isString().isLength({ min: 1 }),
  body("last_name").isString().isLength({ min: 1 }),
  body("email").isEmail().isLength(),
  body("phone").isString().isLength(),
  adminUsersController.postUpdateUser
);
adminUsersRouter.post(
  "/:id/ban",
  bodyParser.urlencoded(),
  adminUsersController.postBanUser
);
adminUsersRouter.post(
  "/:id/unban",
  bodyParser.urlencoded(),
  adminUsersController.postUnbanUser
);
adminUsersRouter.get("/:id/json", adminUsersController.getUserJSON);

module.exports = adminUsersRouter;
