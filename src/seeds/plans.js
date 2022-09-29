const Plan = require("../models/plan");

const plans = [
  {
    isFree: 1,
    title: "Basic",
    description: "",
    price: 0,
    discount: 0,
  },
  {
    isFree: 0,
    title: "Developer",
    description: "",
    price: 30,
    discount: 20,
  },
];

const init = function () {
  for (let plan of plans) {
    // Plan.create(plan);
  }
};

module.exports.PlanSeeds = { init };
