const { localsName } = require("ejs");
const path = require("path");
const { Op, fn } = require("sequelize");
const sequelize = require("sequelize");
const { db } = require("../config/db");

const ApikeyVisit = require("../models/apiKeyVisitsHistory");

const Plan = require("../models/plan");
const Subscription = require("../models/subscriptions");
const User = require("../models/user");
const LogError = require("../utils/errorLog");
const { serverIssue } = require("../utils/statics");

//
const getDashboardPage = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id, {
      include: { model: Subscription },
    });
    const fetchedApikeys = await user.getApikeys({
      include: { model: ApikeyVisit },
    });
    const table = {
      pagination: null,
      heads: ["Remote Address", "Created at"],
      rows: ["Remote Address", "Created at"],
    };
    return res.render(
      path.join("pages", "user", "dashboard", "overview", "main"),
      {
        apiKeys: fetchedApikeys,
        table,
      }
    );
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};

const getApiKeysPage = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    const fetchedApikeys = await user.getApikeys();

    return res.render(path.join("pages", "user", "dashboard", "apikeys"), {
      apiKeys: fetchedApikeys,
    });
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};

const getStatisticsPage = async (req, res) => {
  try {
    const [topVisitedCountriesRows] =
      await db.query(`SELECT COUNT(*) as count, query_country
          FROM users AS u
          JOIN apikeys AS ak
            ON ak.userId = u.id
          JOIN apikey_visits AS akv
            ON ak.id = akv.apikeyId
          WHERE u.id = ${req.session.user.id}
          GROUP BY query_country
          ORDER BY query_country DESC
          LIMIT 10
          `);
    const [visitsRows] = await db.query(`SELECT COUNT(*) as count, query_country
          FROM users AS u
          JOIN apikeys AS ak
            ON ak.userId = u.id
          JOIN apikey_visits AS akv
            ON ak.id = akv.apikeyId
          WHERE u.id = ${req.session.user.id}
          GROUP BY query_country
          ORDER BY query_country DESC
          LIMIT 10
          `);

    /**
     * setting up top countries chart chart
     */
    const countryChartOptions = {
      type: "bar",
      data: {
        labels: topVisitedCountriesRows.map((r) => r.query_country),
        datasets: [
          {
            label: "Top Coutries",
            data: topVisitedCountriesRows.map((r) => r.count),
            backgroundColor: [
              "#1723dc",
              "#b9900b",
              "#c90b43",
              "#236117",
              "#0e085c",
            ],

            borderWidth: 0,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
    /**
     * setting up top visits  chart chart
     */
    const visitsChartOptions = {
      type: "bar",
      data: {
        labels: topVisitedCountriesRows.map((r) => r.query_country),
        datasets: [
          {
            label: "Top Coutries",
            data: topVisitedCountriesRows.map((r) => r.count),
            backgroundColor: [
              "#1723dc",
              "#b9900b",
              "#c90b43",
              "#236117",
              "#0e085c",
            ],

            borderWidth: 0,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    return res.render(path.join("pages", "user", "dashboard", "map"), {
      countryChartOptions,
    });
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};

const getuserSubscription = async (userId) => {
  try {
    const u = await User.findByPk(userId, {
      include: {
        model: Subscription,
        where: { end_date: { [Op.gt]: Date.now() - 24 * 60 * 60 * 1000 } },
        include: {
          model: Plan,
        },
        limit: 1,
      },
    });

    return u.subscriptions.length ? u.subscriptions[0] : null;
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};

const getProfilePage = async (req, res) => {
  try {
    const user = req.session.user;
    res.locals.errorMessage = req.flash("error")[0];
    return res.render(path.join("pages", "user", "profilePage"), {
      user,
    });
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};
const getResetPasswordPage = async (req, res) => {
  try {
    const user = req.session.user;
    res.locals.errorMessage = req.flash("error")[0];
    return res.render(path.join("pages", "user", "reset-password"), {
      user,
    });
  } catch (error) {
    LogError(req, error);
    serverIssue(res);
  }
};

const getServicePage = async (req, res) => {
  const user = req.session.user;
  const subscription = await getuserSubscription(user.id);
  return res.render(path.join("pages", "user", "servicePlanPage"), {
    user,
    subscription,
  });
};

module.exports.userController = {
  getDashboardPage,
  getApiKeysPage,
  getStatisticsPage,
  getProfilePage,
  getServicePage,
  getResetPasswordPage,
};
