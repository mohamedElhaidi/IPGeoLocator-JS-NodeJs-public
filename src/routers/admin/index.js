const { adminController } = require("../../controllers/admin");
const { adminLogsController } = require("../../controllers/admin/logs");
const isAuth = require("../../middleware/is-auth");
const { setPageTitle } = require("../../middleware/setTitle");
const planRouter = require("../plan");
const adminUsersRouter = require("./users");

const adminRouter = require("express").Router();

adminRouter.get("/dashboard", isAuth,setPageTitle("Dashboard"), adminController.getAdminDashboard);
adminRouter.get("/subscriptions", isAuth,setPageTitle("Subscriptions"), adminController.getAdminSubscription);
adminRouter.get("/logs", isAuth,setPageTitle("Logs"), adminLogsController.getAdminLogsPage);
adminRouter.use("/users", isAuth, adminUsersRouter);
adminRouter.use("/plans", isAuth, planRouter);

module.exports = adminRouter;
