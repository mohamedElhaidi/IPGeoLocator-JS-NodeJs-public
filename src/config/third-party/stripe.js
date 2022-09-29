// importing stripe

const stripeInstance = require("stripe")(process.env.STRIPE_API_PRIVATE_KEY);

module.exports = stripeInstance;
