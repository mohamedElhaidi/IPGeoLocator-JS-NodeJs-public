const path = require("path");
const bodyParser = require("body-parser");
const paymentRouter = require("express").Router();

// importing models
const Feature = require("../models/feature");
const Plan = require("../models/plan");
const { paymentController } = require("../controllers/payment");
const isAuth = require("../middleware/is-auth");

paymentRouter.get("/selecting-plan", isAuth, async (req, res) => {
  const plans = await Plan.findAll({
    where: { isFree: false },
    include: { model: Feature },
  });
  res.render(path.join("pages", "payement", "selectPlan"), { plans });
});

paymentRouter.get("/checkout", isAuth, async (req, res) => {
  const { plan_id } = req.query;

  res.render(path.join("pages", "payement", "checkout"), {
    plan_id,
  });
});

// checkoutSessionCreator
paymentRouter.post(
  "/checkout",
  bodyParser.urlencoded({ extended: true }),
  paymentController.postCreateCheckoutSession
);

paymentRouter.post(
  "/validate",
  bodyParser.raw({ type: "application/json" }),
  paymentController.postStripeCheckoutWebhook
);

// feedbacks
paymentRouter.get("/feedback/success", isAuth, async (req, res) => {
  res.render(path.join("pages", "payement", "feedback", "success"));
});
paymentRouter.get("/feedback/fail", isAuth, async (req, res) => {
  res.render(path.join("pages", "payement", "feedback", "fail"));
});

module.exports = paymentRouter;
