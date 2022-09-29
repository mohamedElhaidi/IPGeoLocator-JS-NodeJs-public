require("dotenv").config(); // fetch data from .env in project root folder and puts them in PROCESS.ENV

const express = require("express");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const { db } = require("./src/config/db");
const ipRouter = require("./src/controllers/demo");
const { getLocationInfo, fetchIPAddresses } = require("./src/utils/network");
const authRouter = require("./src/routers/auth");
const userRouter = require("./src/routers/user");
const User = require("./src/models/user");
const Subscription = require("./src/models/subscriptions");
const ApiKey = require("./src/models/apiKey");
const Plan = require("./src/models/plan");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const csrfProtection = require("csurf");
const flash = require("connect-flash");
const apiRouter = require("./src/routers/api/api");
const ApikeyVisit = require("./src/models/apiKeyVisitsHistory");
const adminRouter = require("./src/routers/admin");
const Feature = require("./src/models/feature");
const PlanFeature = require("./src/models/planFeature");
const { FeatureSeeds } = require("./src/seeds/Feature");
const { UserSeeds } = require("./src/seeds/user");
const UnauthorizedAddress = require("./src/models/unauthorizedAddress");
const paymentRouter = require("./src/routers/payment");
const SubscriptionPlan = require("./src/models/subscriptionPlan");
const { PlanSeeds } = require("./src/seeds/plans");
const { setPageTitle } = require("./src/middleware/setTitle");
const docsRouter = require("./src/routers/docs");
const isAuth = require("./src/middleware/is-auth");
const contactRouter = require("./src/routers/contact");
const requestIp = require("request-ip");
// ================================
// ================================
// ======                   =======
// ===   PROJECT SETTINGS   =======
// ======                   =======
// ================================
// ================================
// ================================

// ================================
// ================================
// ======                   =======
// ===   EXPRESS SETTINGS   =======
// ======                   =======
// ================================
// ================================
// ================================
const expressApp = express();
// render engine
expressApp.set("view engine", "ejs");
expressApp.set("views", path.join(__dirname, "src", "views"));

// ================================
// ================================
// ======                   =======
// ======   STATIC ROUTES   =======
// ======                   =======
// ================================
// ================================
// ================================
// session
// static route for /css
expressApp.use(
  "/css",
  express.static(path.join(__dirname, "src", "public", "css"))
);
// static route for /js
expressApp.use(
  "/js",
  express.static(path.join(__dirname, "src", "public", "js"))
);
// static route for /img
expressApp.use(
  "/img",
  express.static(path.join(__dirname, "src", "public", "img"))
);

// ================================
// ================================
// ======              ============
// ======   SESSIONS   ============
// ======              ============
// ================================
// ================================
// ================================
// session

var options = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

var sessionStore = new MySQLStore(options);

expressApp.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

// CSRF / passing some values to views
// expressApp.use(csrfProtection());
expressApp.use((req, res, next) => {
  console.log("isAdmin?", req.session.isAdmin ? true : false);
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.user = req.session.user;

  // res.locals.csrfToken = req.csrfToken();
  next();
});

// session flash for temporarily storing messages across requests
expressApp.use(flash());

// fetch the real ip of the user even when they are using a proxy
expressApp.use(
  requestIp.mw() // important to fetch the clients ip and merges it with req object
);

// ================================
// ================================
// =====              =============
// =====    ROUTES    =============
// =====              =============
// ================================
// ================================
// ================================
// routes

expressApp.use((req, res, next) => {
  res.locals.pageTitle = "----";
  res.locals.APP_URL = process.env.APP_URL;
  res.locals.APP_NAME = process.env.APP_NAME;

  next();
});

expressApp.use("/demopage", (req, res, next) => {
  res.send(`<script>
                fetch("http://160.179.168.122:8080/api/json/1.1.1.1?key=1hzzh1ScWHFQkbMN").then(async res => {
                  console.log(await res.json())
              }).catch(err => {
                  console.log(err);
              })
            </script>`);
});

expressApp.use("/auth", authRouter);

expressApp.use("/admin", isAuth, adminRouter);

expressApp.use("/user", isAuth, userRouter);

expressApp.use("/api", apiRouter);

expressApp.use("/payment", paymentRouter);

expressApp.use("/contact", contactRouter);

// expressApp.use("/demo", demoRouter); //for demo

expressApp.use(
  "/pricing",
  setPageTitle("Pricing"),
  (req, res, next) => {
    res.locals.page = "pricing";
    next();
  },
  async (req, res) => {
    const plans = await Plan.findAll({ include: { model: Feature } });
    res.render(path.join("pages", "pricing"), { plans });
  }
);
expressApp.use(
  "/legal",
  setPageTitle("Legal"),
  (req, res, next) => {
    res.locals.page = "legal";
    next();
  },
  async (req, res) => {
    const plans = await Plan.findAll({ include: { model: Feature } });
    res.render(path.join("pages", "tos", "legal"));
  }
);
expressApp.use(
  "/privacy-policy",
  setPageTitle("Privacy policy"),
  (req, res, next) => {
    res.locals.page = "privacy-policy";
    next();
  },
  async (req, res) => {
    const plans = await Plan.findAll({ include: { model: Feature } });
    res.render(path.join("pages", "tos", "privacy-policy"));
  }
);

expressApp.use(
  "/docs",
  (req, res, next) => {
    res.locals.page = "docs";
    next();
  },
  docsRouter
);

// home page :)
expressApp.get(
  "/",
  (req, res, next) => {
    res.locals.page = "home";
    next();
  },
  setPageTitle("Home"),

  async (req, res, next) => {
    // const ips = fetchIPAddresses(req);
    // if (!ips) return res.status(403).send({ status: "fail" });
    // const locationDataInfo = await getLocationInfo(ips.ipv6 || ips.ipv4);
    const ip = req.clientIp;
    const locationDataInfo = await getLocationInfo(ip);
    return res.render(path.join("pages", "home"), {
      ip,
      locationDataInfo,
    });
  }
);

// 404
expressApp.use((req, res) => {
  return res.status(404).render(path.join("pages", "static", "404"), {});
});

// ================================
// ================================
// =======              ===========
// =======   DATABASE   ===========
// =======              ===========
// ================================
// ================================
// ================================

// DATABASE RELATIONSHIPS

// Subscription user relations
User.hasMany(Subscription);
Subscription.belongsTo(User);

// apikey user relations
User.hasMany(ApiKey);
ApiKey.belongsTo(User);

// apikey relations
User.belongsToMany(ApiKey, { through: "user_apikey" });
ApiKey.belongsTo(User);
ApiKey.hasMany(ApikeyVisit);
ApikeyVisit.belongsTo(ApiKey);
ApiKey.hasMany(UnauthorizedAddress);
UnauthorizedAddress.belongsTo(ApiKey);

//
Subscription.belongsTo(Plan);
Plan.belongsToMany(Subscription, { through: SubscriptionPlan });
//
Plan.belongsToMany(Feature, { through: PlanFeature });
Feature.belongsToMany(Plan, { through: PlanFeature });

// DATABASE INITIALIZING
const DB_RESET = 0;

db.sync({ force: DB_RESET })
  .then(function (r) {
    // http.createServer(expressApp).listen(8080);

    // This line is from the Node.js HTTPS documentation.
    // var options = {
    //   key: fs.readFileSync("test/fixtures/keys/agent2-key.pem"),
    //   cert: fs.readFileSync("test/fixtures/keys/agent2-cert.cert"),
    // };

    // Create a service (the app object is just a callback).
    var app = express();

    // Create an HTTP service.
    http.createServer(expressApp).listen(process.env.PORT || 80, "0.0.0.0");
    // try {
    //   // Create an HTTPS service identical to the HTTP service.
    //   https.createServer(options, expressApp).listen(443);
    // } catch (error) {
    //   console.error(error);
    // }

    // seeding
    if (DB_RESET) {
      UserSeeds.init();
      FeatureSeeds.init();
      PlanSeeds.init();
    }
  })
  .catch(function (error) {
    console.log(error);
  });
