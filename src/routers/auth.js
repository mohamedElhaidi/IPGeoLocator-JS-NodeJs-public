const authRouter = require("express").Router();
const bodyParser = require("body-parser");
const path = require("path");
const Plan = require("../models/plan");
const Feature = require("../models/feature");
const { authController } = require("../controllers/auth");
const { body, validationResult } = require("express-validator");
const { setPageTitle } = require("../middleware/setTitle");

authRouter.get("/login", setPageTitle("Login"), authController.getLoginPage);

authRouter.get("/logout", setPageTitle("logout"), authController.getLogout);

authRouter.get(
  "/register",
  setPageTitle("Reigster"),
  authController.getRegisterPage
);

authRouter.get("/verify", setPageTitle("Verify"), authController.getVerifyUser);

authRouter.post(
  "/login",
  bodyParser.urlencoded({ extended: true }),
  body("email").isEmail(),
  authController.postLogin
);

authRouter.post(
  "/register",
  bodyParser.urlencoded({ extended: true }),
  body("first_name").isString().isLength({ min: 1, max: 50 }),
  body("last_name").isString().isLength({ min: 1, max: 50 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("address1").isString().isLength({ min: 1, max: 200 }),
  body("code_postal").isNumeric(),

  authController.postRegister
);

authRouter.post(
  "/update",
  bodyParser.urlencoded({ extended: true }),
  body("first_name").isString().isLength({ min: 1, max: 50 }),
  body("last_name").isString().isLength({ min: 1, max: 50 }),
  body("email").isEmail(),
  body("password").exists(),
  body("address1").isString().isLength({ min: 1, max: 200 }),
  body("code_postal").isNumeric(),

  authController.postUpdateInformation
);
authRouter.post(
  "/reset-password",
  bodyParser.urlencoded({ extended: true }),
  body("current_password").exists(),
  body("new_password").isLength({ min: 8 }),

  authController.postResetPassword
);

// 1
authRouter.get(
  "/forgot-password",
  setPageTitle("Forgot password"),
  (req, res) => {
    res.locals.errorMessage = req.flash("error")[0];
    res.render(path.join("pages", "auth", "forgot"));
  }
);

// 2
authRouter.post(
  "/forgot-password",
  bodyParser.urlencoded(),
  body("email").isEmail(),
  authController.postForgotPassword
);

// 3
authRouter.get("/new-password", setPageTitle("New Password"), (req, res) => {
  res.locals.errorMessage = req.flash("error")[0];
  const { email, code } = req.query;
  res.render(path.join("pages", "auth", "new-password"), { email, code });
});

// 4
authRouter.post(
  "/forgot-password-validation",
  bodyParser.urlencoded(),
  body("code").isString(),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  authController.postForgotPasswordValidation
);
/**
 *
 *
 * FEEDBACK
 *
 *
 */

// feedback
authRouter.get(
  "/feedback/verification-requested",
  setPageTitle("Verification is need"),
  (req, res) => {
    res.render(
      path.join("pages", "auth", "feedback", "verification-request"),
      {}
    );
  }
);
authRouter.get(
  "/feedback/verification-successed",
  setPageTitle("Verification successed"),
  (req, res) => {
    res.render(
      path.join("pages", "auth", "feedback", "verification-success"),
      {}
    );
  }
);

module.exports = authRouter;
