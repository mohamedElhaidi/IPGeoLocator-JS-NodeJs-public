const path = require("path");
const User = require("../../models/user");
const Plan = require("../../models/plan");
const pagination = require("../../utils/pagination");
const Subscription = require("../../models/subscriptions");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const LogError = require("../../utils/errorLog");

const getAdminDashboard = async (req, res) => {
  return res.render(path.join("pages", "admin", "dashboard"), {});
};
const getAdminSubscription = async (req, res) => {
  try {
    const offset = req.query.offset || 0;
    const numberPerPage = req.query.limit || 10;
    const search = req.query.search;

    let query_str = "";
    if (search) {
      query_str = `%${search.trim()}%`;
    }
    // data
    const subs = await Subscription.findAll({
      fields: ["infinte", "cost", "start_date", "end_date", "contract_type"],
      include: [
        {
          model: User,
          fields: ["email"],
          where: search
            ? {
                [Op.or]: [{ email: { [Op.like]: query_str } }],
              }
            : {},
        },
        {
          model: Plan,
        },
      ],

      limit: +numberPerPage,
      offset: +offset,
    });

    // total sum
    const { sum: totalProfit } = (
      await Subscription.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("cost")), "sum"],
          [sequelize.fn("COUNT", sequelize.col("*")), "count"],
        ],
      })
    ).dataValues;

    // count
    const { count } = (
      await Subscription.findOne({
        attributes: [[sequelize.fn("COUNT", sequelize.col("*")), "count"]],
        include: [
          {
            model: User,
            fields: ["email"],
            where: search
              ? {
                  [Op.or]: [{ email: { [Op.like]: query_str } }],
                }
              : {},
          },
        ],
      })
    ).dataValues;

    // count
    const subsCount = count;

    // pagination
    const pag = pagination(subsCount, offset, numberPerPage);

    // building table obj
    const table = {
      search,
      pagination: pag,
      heads: ["Email", "plan", "infinte", "cost", "start_date", "end_date"],
      rows: [],
    };

    //injecting data into the table
    table.rows = subs.map((i) => {
      return {
        cols: [
          i.user ? i.user.email : "",
          i.plan.title,
          i.infinte,
          i.cost,
          i.start_date,
          i.end_date,
        ],
      };
    });

    // render
    return res.render(path.join("pages", "admin", "subscriptions"), {
      table,
      totalProfit,
      query: "",
    });
  } catch (error) {
    console.error(error);
    LogError(error);
    res.redirect("/admin/subscriptions");
  }
};
const getAdminPlansPage = async (req, res) => {
  const plans = await Plan.findAll({ fields: ["id", "key", "domain"] });
  return res.render(path.join("pages", "admin", "plans"), { plans });
};

module.exports.adminController = {
  getAdminDashboard,
  getAdminPlansPage,
  getAdminSubscription,
};
