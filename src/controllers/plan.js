const path = require("path");
const { Op } = require("sequelize");
const stripeInstance = require("../config/third-party/stripe");
const Feature = require("../models/feature");
const Plan = require("../models/plan");
const { validationResult } = require("express-validator");
const Log = require("../models/log");
const logMe = require("../utils/log");
const { serverIssue } = require("../utils/statics");
const LogError = require("../utils/errorLog");

const getPlanPage = async (req, res, next) => {
  try {
    const features = await Feature.findAll();
    return res.render(path.join("pages", "admin", "editPlan"), {
      errorMessage: null,
      plan: null,
      planFeaturesIds: null,
      features,
    });
  } catch (error) {
    LogError(req, error);
    console.log(error);
    serverIssue(res);
  }
};

const getEditPlanPage = async (req, res, next) => {
  try {
    const [error] = req.flash("error");
    const { id } = req.params;
    if (!id) {
      //invalid id
      return next();
    }
    const plan = await Plan.findByPk(id);
    if (!plan) {
      // plan not found
      return next();
    }
    const features = await Feature.findAll();
    const planFeaturesIds = (await plan.getFeatures({ fields: ["id"] })).map(
      (f) => f.id
    );

    // breadcrumb
    res.locals.breadcrumb = [
      { url: "/admin/plans/", name: "Plans" },
      { url: "/admin/plans/" + plan.id, name: plan.title },
    ];
    return res.render(path.join("pages", "admin", "editPlan"), {
      errorMessage: error,
      plan,
      planFeaturesIds,
      features,
    });
  } catch (error) {
    LogError(req, error);
    console.log(error);
    serverIssue(res);
  }
};

const postCreateAPlan = async (req, res, next) => {
  const { title, description, price, discount, features, isFree } = req.body;
  try {
    /**
     * fetching validation result
     */
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      throw new Error(errors.array()[0].param + ": " + errors.array()[0].msg);
    }

    /**
     * finding all features records matching the input
     */
    const fetchedFeatures = await Feature.findAll({
      where: { id: { [Op.in]: features } },
    });

    /**
     * creating product in our stripe account
     * and retrieve it
     */
    let stripe_plan;
    if (!Boolean(isFree)) {
      stripe_plan = await stripeInstance.products.create({
        name: title,
        description,
        default_price_data: {
          unit_amount: price * 100,
          currency: "usd",
          // recurring: { interval: "year" },
        },
        expand: ["default_price"],
      });
    }

    /**
     * create a plan using provided info with product api id
     */

    const createdPlan = await Plan.create({
      title,
      description,
      price,
      discount,
      isFree: Boolean(isFree),
      stripe_plan_id: Boolean(isFree) ? null : stripe_plan.id,
      stripe_plan_price_id: Boolean(isFree)
        ? null
        : stripe_plan.default_price.id,
    });

    /**
     * adding features to the created plan
     */
    await createdPlan.addFeatures(fetchedFeatures);

    /**
     * logging
     */
    logMe(
      "plan_creation_successed",
      `plan_id: ${createdPlan.id} by user: ${req.session.user.email}`
    );

    /**
     * redirect
     */
    return res.redirect("/admin/plans");

    //
  } catch (error) {
    console.error(error);
    const { message } = error;

    /**
     * logging
     */
    logMe("plan_creation_failed", message);
    LogError(req, error);
    serverIssue(res);
    /**
     * passing data
     */
    req.flash("error", message);
    res.status(400).redirect("/admin/plans/new"); // redirect to same url
  }
};

const putUpdateAPlan = async (req, res, next) => {
  const { plan_id, title, description, price, discount, features, isFree } =
    req.body;
  try {
    // get plan by Id
    if (!plan_id) {
      // id is null
      console.log("invalid id input");
      return next();
    }
    const fetchedPlan = await Plan.findByPk(plan_id);
    if (!fetchedPlan) {
      // plan not found
      console.log("plan not found, id: " + plan_id);
      return next();
    }

    // fetch features
    const fetchedFeatures = await Feature.findAll({
      where: { id: { [Op.in]: features } },
    });

    /**
     * creating product in our stripe account
     * and retrieve it
     */

    let stripe_plan = null;
    if (!fetchedPlan.stripe_plan_id)
      stripe_plan = await stripeInstance.products.create({
        name: title,
        description,
        default_price_data: {
          unit_amount: price * 100,
          currency: "usd",
          // recurring: { interval: "year" },
        },
        expand: ["default_price"],
      });

    let newPrice;
    /**
     * delete product in stripe if we set the plan to be free
     */
    if (Boolean(isFree) && fetchedPlan.stripe_plan_id) {
      //
      // archive the product

      await stripeInstance.products.update(fetchedPlan.stripe_plan_id, {
        active: false,
      });
    } else if (fetchedPlan.stripe_plan_id) {
      await stripeInstance.products.update(fetchedPlan.stripe_plan_id, {
        active: true,
      });
      //++++++++++++++++++++++++++++++++++++
      // u cannot change the prcie of a recuring subscription, code below will not work
      //++++++++++++++++++++++++++++++++++

      newPrice = await stripeInstance.prices.create({
        product: fetchedPlan.stripe_plan_id,
        currency: "usd",
        unit_amount: price * 100,
      });

      /**
       * update product in stripe with the new info and price
       */
      await stripeInstance.products.update(fetchedPlan.stripe_plan_id, {
        name: title,
        description,
        default_price: newPrice.id,
      });
    }

    /**
     * updating plan
     */
    await fetchedPlan.update({
      title,
      description,
      price,
      discount,
      isFree: Boolean(isFree),
      stripe_plan_id: stripe_plan ? stripe_plan.id : fetchedPlan.stripe_plan_id,
      stripe_plan_price_id: stripe_plan
        ? newPrice
          ? newPrice.id
          : stripe_plan.default_price.id
        : fetchedPlan.stripe_plan_price_id,
    });

    /**
     * updating features
     */
    await fetchedPlan.setFeatures(fetchedFeatures);

    /**
     * logging
     */
    logMe(
      "plan_update_successed",
      `plan_id: ${fetchedPlan.id} by user: ${req.session.user.email}`
    );

    /**
     * redirect
     */
    return res.redirect("/admin/plans");

    //
  } catch (error) {
    console.error(error);
    const { message } = error;

    /**
     * logging
     */
    logMe("plan_update_failed", message);
    LogError(req, error);
    serverIssue(res);
    /**
     * passing data
     */
    req.flash("error", message);
    res.status(400).redirect("/admin/plans/" + plan_id); // redirect to same url
  }
};

const getDeleteAPlan = async (req, res, next) => {
  const { plan_id } = req.query;
  if (!plan_id) {
    // plan id not valid
    return next();
  }
  const fetchedPlan = await Plan.findByPk(plan_id);
  if (!fetchedPlan) {
    // plan not found
    return next();
  }

  try {
    /**
     * delete the product in stripe
     */

    await stripeInstance.products.update(fetchedPlan.stripe_plan_id, {
      active: false,
    });
    /**
     * delete the plan
     */
    await fetchedPlan.destroy();

    /**
     * logging
     */
    logMe(
      "plan_delete_successed",
      `a plan called ${fetchedPlan.title} has been deleted by ${req.session.user.email}`
    );

    return res.redirect("/admin/plans");
    //
  } catch (error) {
    console.error(error);
    req.flash("error", error.message);
    /**
     * logging
     */
    LogError(req, error);
    serverIssue(res);
    logMe("plan_delete_failed", meserror.messagesage);
    return res.redirect("/admin/plans/" + plan_id);
  }
};

module.exports.planController = {
  getPlanPage,
  getEditPlanPage,
  postCreateAPlan,
  putUpdateAPlan,
  getDeleteAPlan,
};
