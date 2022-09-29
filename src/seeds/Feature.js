const Feature = require("../models/feature");

const features = [
  {
    title: "Frequently updated database",
    description: "",
  },
  {
    title: "JSON(P), CSV, XML, Text, PHP, Batch",
    description: "",
  },
  {
    title: "IPv4, IPv6 and domain queries",
    description: "",
  },
  {
    title: "Customized support",
    description: "",
  },
  {
    title: "Anycast network with 23 PoPs",
    description: "",
  },
  {
    title: "Commercial use allowed",
    description: "",
  },
  {
    title: "API keys",
    description: "",
  },
  {
    title: "SSL (HTTPS)",
    description: "",
  },
  {
    title: "Usage statistics",
    description: "",
  },
  {
    title: "Access restrictions",
    description: "",
  },
  {
    title: "99.9% SLA",
    description: "",
  },
  {
    title: "Custom terms or agreements",
    description: "",
  },
];

const init = function () {
  for (let feature of features) {
    Feature.create(feature);
  }
};

module.exports.FeatureSeeds = { init };
