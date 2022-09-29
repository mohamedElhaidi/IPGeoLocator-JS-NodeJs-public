const { userController } = require("../controllers/user");
const apiKeysRouter = require("./apiKeys");
const isAuth = require("../middleware/is-auth");
const { setPageTitle } = require("../middleware/setTitle");

const userRouter = require("express").Router();

userRouter.get("/dashboard", setPageTitle("redirect"), (req, res) =>
  res.redirect("/user/dashboard/api-keys")
);

userRouter.get(
  "/dashboard/api-keys",
  setPageTitle("API"),
  userController.getApiKeysPage
);

userRouter.get(
  "/dashboard/statistics",
  setPageTitle("Statistics"),
  userController.getStatisticsPage
);

userRouter.use(
  "/dashboard/api-keys",
  setPageTitle("API"),
  isAuth,
  apiKeysRouter
);

userRouter.get(
  "/profile",
  setPageTitle("Profile"),
  userController.getProfilePage
);
userRouter.get(
  "/profile/reset-password",
  setPageTitle("Reset Password"),
  userController.getResetPasswordPage
);

// userRouter.get(
//   "/profile/billing",
//   setPageTitle("Billing"),
//   userController.getBillingPage
// );
userRouter.get(
  "/profile/service-plan",
  setPageTitle("Service Plan"),
  userController.getServicePage
);

module.exports = userRouter;
