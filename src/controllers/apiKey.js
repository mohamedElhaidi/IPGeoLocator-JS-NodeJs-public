const path = require("path");
const { Op } = require("sequelize");
const ApiKey = require("../models/apiKey");
const ApikeyVisit = require("../models/apiKeyVisitsHistory");
const User = require("../models/user");
const LogError = require("../utils/errorLog");
const pagination = require("../utils/pagination");
const { generateString } = require("../utils/random");
const { serverIssue } = require("../utils/statics");

const getNewApiKeyPage = (req, res) => {
  try {
    return res.render(path.join("pages", "editApiKey"));
  } catch (error) {
    LogError(req, error);
    return serverIssue(res);
  }
};

const getApiKeyPage = async (req, res) => {
  try {
    let search = req.query.search;

    const apiKeyId = req.params.id;
    const offset = req.query.offset || 0;
    const numberPerPage = req.query.limit || 15;
    if (!apiKeyId) {
      throw new Error("apikey id is not valid");
    }
    let like = "";
    if (search) {
      search = search.trim();
      like = `%${search}%`;
    }
    const apiKey = await ApiKey.findByPk(apiKeyId, {
      include: {
        where: search
          ? {
              [Op.or]: [
                { query: { [Op.like]: like } },
                { query_country: { [Op.like]: like } },
                { query_city: { [Op.like]: like } },
                { query_regionName: { [Op.like]: like } },
              ],
            }
          : {},
        attributes: [
          "query",
          "query_country",
          "query_city",
          "query_regionName",
          "status",
          "createdAt",
        ],
        model: ApikeyVisit,
        limit: +numberPerPage,
        offset: +offset,
      },
    });

    const itemCount = await apiKey.countApikey_visits();
    const successfulCount = await apiKey.countApikey_visits({
      where: { status: 1 },
    });
    const failedCount = await apiKey.countApikey_visits({
      where: { status: 0 },
    });

    async function getCountSuccessfulAndFailedRequests(apiKey) {
      const monthsNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const months = [];
      const successes_count = [];
      const fails_count = [];

      const now = new Date();
      let endPeriodDate = new Date();
      for (let i = 0; i <= 5; i++) {
        const startPeriodDate = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        ); //1st day in month
        /**
         * count successful requests for a period of time
         */
        const period_successful_requests_count =
          await apiKey.countApikey_visits({
            where: {
              status: 1,
              createdAt: {
                [Op.lt]: endPeriodDate,
                [Op.gt]: startPeriodDate,
              },
            },
          });

        /**
         * count failed requests  for a period of time
         */
        const period_failed_requests_count = await apiKey.countApikey_visits({
          where: {
            status: 0,
            createdAt: {
              [Op.lt]: endPeriodDate,
              [Op.gt]: startPeriodDate,
            },
          },
        });

        /**
         * push counts
         */
        months.push(
          monthsNames[+startPeriodDate.getMonth()] +
            "-" +
            startPeriodDate.getFullYear()
        );
        successes_count.push(period_successful_requests_count);
        fails_count.push(period_failed_requests_count);

        /**
         * set previous to date
         * each time we loop the previous will be greater
         */
        endPeriodDate = startPeriodDate;
      }

      // return data
      return { months, successes_count, fails_count };
    }

    const counts = await getCountSuccessfulAndFailedRequests(apiKey);

    // creating chart options object
    const requstsCountChartOptions = {
      type: "line",
      data: {
        labels: counts.months,
        datasets: [
          {
            label: "Successful",
            data: counts.successes_count,
            backgroundColor: "rgb(11, 138, 102)",
            borderColor: "rgb(11, 138, 102)",
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Failed",
            data: counts.fails_count,
            backgroundColor: "rgba(255, 0, 0)",
            borderColor: "rgba(255, 15, 0)",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      },
    };
    const pag = pagination(itemCount, offset, numberPerPage);
    const table = {
      pagination: pag,
      heads: ["query", "country", "city", "region", "status", "date"],
      rows: [],
    };
    table.rows = apiKey.apikey_visits.map((i) => {
      return {
        cols: [
          i.query,
          i.query_country,
          i.query_city,
          i.query_regionName,
          i.status ? "successed" : "failed",
          i.createdAt,
        ],
      };
    });

    // breadcrumb
    res.locals.breadcrumb = [
      { url: "/user/dashboard/api-keys", name: "API Keys" },
      { url: "/user/dashboard/user/api-keys/" + apiKeyId, name: "Main" },
    ];

    return res.render(path.join("pages", "apiKey"), {
      errorMessage: null,
      apikey: apiKey,
      visitCount: itemCount,
      failedCount,
      successfulCount,
      requstsCountChartOptions,
      table,
      search: search || "",
    });
  } catch (error) {
    LogError(req, error);
    return serverIssue(res);
  }
};

const getApiKeyHistoryPage = async (req, res) => {
  try {
    let search = req.query.search;
    const apiKeyId = req.params.id;
    const offset = req.query.offset || 0;
    const numberPerPage = req.query.limit || 15;

    if (!apiKeyId) {
      throw new Error("apikey id is not valid");
    }
    let like = "";
    if (search) {
      search = search.trim();
      like = `%${search}%`;
    }
    const apiKey = await ApiKey.findByPk(apiKeyId, {
      include: {
        where: search
          ? {
              [Op.or]: [
                { query: { [Op.like]: like } },
                { query_country: { [Op.like]: like } },
                { query_city: { [Op.like]: like } },
                { query_regionName: { [Op.like]: like } },
              ],
            }
          : {},
        attributes: [
          "query",
          "query_country",
          "query_city",
          "query_regionName",
          "status",
          "createdAt",
        ],
        model: ApikeyVisit,
        limit: +numberPerPage,
        offset: +offset,
      },
    });

    const itemCount = await apiKey.countApikey_visits();

    const pag = pagination(itemCount, offset, numberPerPage);

    const table = {
      pagination: pag,
      heads: ["query", "country", "city", "region", "status", "date"],
      rows: [],
    };

    table.rows = apiKey.apikey_visits.map((i) => {
      return {
        cols: [
          i.query,
          i.query_country,
          i.query_city,
          i.query_regionName,
          i.status ? "successed" : "failed",
          i.createdAt,
        ],
      };
    });

    // breadcrumb
    res.locals.breadcrumb = [
      { url: "/user/dashboard/api-keys", name: "API Keys" },
      { url: "/user/dashboard/api-keys/" + apiKeyId, name: "Main" },
      {
        url: "/user/dashboard/api-keys/" + apiKeyId + "/history",
        name: "History",
      },
    ];

    return res.render(path.join("pages", "apiKeyHistory"), {
      errorMessage: null,
      apikey: apiKey,
      table,
      search: search || "",
    });
  } catch (error) {
    LogError(req, error);
    return serverIssue(res);
  }
};

/**
 *
 */
const postCreateApiKey = async (req, res) => {
  try {
    let domain = req.body.domain;
    domain = domain.trim();

    // verify inputs
    if (0) {
      // invalid domain name
      const err = new Error("Invalid domain name!");
      err.name = "domain-invalid";
      throw err;
    }

    // create new api key
    const key = req.session.user.id + generateString(15);
    const user = await User.findByPk(req.session.user.id);
    const apiKey = await ApiKey.create({ domain, key });
    user.addApikey(apiKey).catch((err) => {
      console.log(err);
      err.message = "issue with creating a new key, please try later!";
      err.name = "apiKey-backend-issue";
      throw err;
    });

    // redirect
    return res.redirect("/user/dashboard/api-keys");
  } catch (error) {
    console.log(error);
    LogError(req, error);

    let message = "";
    if (error.name in ["apiKey-backend-issue", "domain-invalid"])
      message = error.message;

    req.flash("errorMessage", message);
    return res.redirect("/user/dashboard/api-keys/newApiKey");
  }
};

module.exports.apiKeyController = {
  getNewApiKeyPage,
  postCreateApiKey,
  getApiKeyPage,
  getApiKeyHistoryPage,
};
