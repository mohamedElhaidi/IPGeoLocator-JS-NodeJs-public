const { contactController } = require("../controllers/contact");
const { userController } = require("../controllers/user");
const { setPageTitle } = require("../middleware/setTitle");
const bodyParser = require("body-parser");
const contactRouter = require("express").Router();
const { body } = require("express-validator");
contactRouter.get(
  "/",
  setPageTitle("Contact"),
  contactController.getContactPage
);

/**
 * new ticket
 */
contactRouter.post(
  "/new",
  setPageTitle("Submitting"),
  bodyParser.urlencoded({ extended: true }),
  body("full_name").isString(),
  body("email").isEmail(),
  body("title").isString(),
  body("message").isString(),
  contactController.postTicket
);

module.exports = contactRouter;
